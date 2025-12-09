let pyodide = null;
let isLoading = false;
let loadPromise = null;

// Lazy-load Pyodide when needed
export const loadPyodide = async () => {
  // If already loaded, return it
  if (pyodide) {
    return pyodide;
  }

  // If currently loading, wait for it to complete
  if (isLoading && loadPromise) {
    return loadPromise;
  }

  // Start loading
  isLoading = true;
  loadPromise = (async () => {
    try {
      // Load Pyodide from CDN
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
      script.type = 'text/javascript';

      // Create a promise that resolves when Pyodide is loaded
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });

      // Initialize Pyodide
      pyodide = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
      });

      // Load common packages that are available in Pyodide
      // Note: 'requests' is not available, but we can use micropip to install it if needed
      await pyodide.loadPackage(['micropip', 'numpy', 'pandas']);

      console.log('Pyodide loaded successfully');
      return pyodide;
    } catch (error) {
      console.error('Failed to load Pyodide:', error);
      throw error;
    } finally {
      isLoading = false;
      loadPromise = null;
    }
  })();

  return loadPromise;
};

// Execute Python code using Pyodide
export const runPython = async (code) => {
  try {
    // Trim whitespace and check if code is empty
    const trimmedCode = code.trim();
    if (!trimmedCode) {
      return {
        success: true,
        output: 'No code to execute',
        error: null
      };
    }

    // Debug log
    console.log('Executing Python code:', trimmedCode.substring(0, 100));

    const pyodideInstance = await loadPyodide();

    // Capture stdout
    pyodideInstance.runPython(`
      import sys
      from io import StringIO
      sys.stdout = StringIO()
    `);

    // Run the user's code
    let result = pyodideInstance.runPython(code);

    // Get the captured output
    const output = pyodideInstance.runPython(`
      output = sys.stdout.getvalue()
      sys.stdout = sys.__stdout__  # Restore stdout
      output
    `);

    // Prepare the result
    let finalOutput = output;

    // If there's a return value and no stdout output, show the return value
    if (!output && result !== undefined && result !== null) {
      // Handle Pyodide proxy objects
      if (result && typeof result === 'object' && result.toJs) {
        const jsResult = result.toJs();
        if (Array.isArray(jsResult) || typeof jsResult === 'object') {
          finalOutput = JSON.stringify(jsResult, null, 2);
        } else {
          finalOutput = String(jsResult);
        }
      } else if (result && typeof result === 'object') {
        finalOutput = JSON.stringify(result, null, 2);
      } else {
        finalOutput = String(result);
      }
    }

    return {
      success: true,
      output: finalOutput || 'Code executed successfully (no output)',
      error: null
    };
  } catch (error) {
    // Provide more user-friendly error messages
    let errorMessage = error.message || String(error);
    let suggestion = null;

    // Handle common Python syntax errors
    if (errorMessage.includes('SyntaxError')) {
      if (errorMessage.includes('//')) {
        errorMessage = 'Syntax Error: Python uses # for comments, not //';
        suggestion = 'Click "Convert JS Comments" to fix this automatically';
      } else if (errorMessage.includes('invalid syntax')) {
        const firstLine = errorMessage.split('\n')[0];
        errorMessage = `Python Syntax Error: ${firstLine}`;

        // Check for common issues
        if (errorMessage.includes('unexpected') && errorMessage.includes('indent')) {
          suggestion = 'Python uses indentation (spaces) instead of braces {}';
        }
      }
    }

    // Check for JavaScript-specific syntax in Python
    if (code.includes('console.log') || code.includes('const ') || code.includes('let ')) {
      suggestion = 'This looks like JavaScript code. Make sure you selected Python language';
    }

    const fullMessage = suggestion ? `${errorMessage}\n\n💡 ${suggestion}` : errorMessage;

    return {
      success: false,
      output: null,
      error: fullMessage,
      suggestion: suggestion
    };
  }
};

// Check if Pyodide is available
export const isPyodideLoaded = () => {
  return pyodide !== null;
};

// Load additional packages on demand
export const loadPyodidePackage = async (packageName) => {
  const pyodideInstance = await loadPyodide();

  try {
    // First try to load directly from Pyodide packages
    await pyodideInstance.loadPackage(packageName);
    console.log(`Package ${packageName} loaded successfully`);
    return true;
  } catch (error) {
    // If direct loading fails, try with micropip
    if (packageName !== 'micropip') {
      try {
        await pyodideInstance.runPython(`
          import micropip
          micropip.install('${packageName}')
        `);
        console.log(`Package ${packageName} installed via micropip`);
        return true;
      } catch (pipError) {
        console.error(`Failed to install ${packageName} via micropip:`, pipError);
        return false;
      }
    }
    console.error(`Failed to load package ${packageName}:`, error);
    return false;
  }
};

// Preload Pyodide (can be called on app initialization)
export const preloadPyodide = () => {
  return loadPyodide();
};