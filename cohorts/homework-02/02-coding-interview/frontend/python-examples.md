# Python Code Examples for Pyodide

## Basic Operations
```python
# Print statements
print("Hello from Python!")

# Variables and types
name = "Pyodide"
version = "0.24.1"
print(f"Running {name} v{version}")

# Lists and operations
numbers = [1, 2, 3, 4, 5]
squares = [x**2 for x in numbers]
print(f"Numbers: {numbers}")
print(f"Squares: {squares}")
```

## Working with NumPy (available in Pyodide)
```python
import numpy as np

# Create arrays
arr = np.array([1, 2, 3, 4, 5])
print(f"Array: {arr}")
print(f"Mean: {np.mean(arr)}")
print(f"Sum: {np.sum(arr)}")

# Matrix operations
matrix = np.array([[1, 2], [3, 4]])
print(f"Matrix:\n{matrix}")
print(f"Matrix determinant: {np.linalg.det(matrix)}")
```

## Working with Pandas (available in Pyodide)
```python
import pandas as pd

# Create a DataFrame
data = {
    'name': ['Alice', 'Bob', 'Charlie'],
    'age': [25, 30, 35],
    'city': ['New York', 'London', 'Tokyo']
}

df = pd.DataFrame(data)
print(df)

# Basic operations
print(f"\nAverage age: {df['age'].mean()}")
print(f"\nCities: {df['city'].tolist()}")
```

## Data Structures
```python
# Dictionaries
person = {
    'name': 'John Doe',
    'age': 30,
    'skills': ['Python', 'JavaScript', 'SQL']
}

# Access and modify
print(f"Name: {person['name']}")
person['age'] = 31
person['skills'].append('React')

print(f"Updated person: {person}")

# Sets (unique values)
unique_numbers = {1, 2, 2, 3, 3, 4}
print(f"Unique numbers: {unique_numbers}")
```

## Functions and Classes
```python
# Define a function
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print(f"5! = {factorial(5)}")
print(f"10! = {factorial(10)}")

# Define a class
class Calculator:
    def __init__(self):
        self.result = 0

    def add(self, x):
        self.result += x
        return self

    def multiply(self, x):
        self.result *= x
        return self

    def get_result(self):
        return self.result

calc = Calculator()
result = calc.add(5).multiply(3).add(2).get_result()
print(f"Calculation result: {result}")
```

## File Operations (Limited in Browser)
```python
# Note: Full file system access is restricted in the browser
# But you can work with in-memory file-like objects

from io import StringIO

# Create a virtual file
content = StringIO()
content.write("Line 1\n")
content.write("Line 2\n")
content.write("Line 3\n")

# Read from it
content.seek(0)
lines = content.readlines()
print(f"Lines: {lines}")
```

## Error Handling
```python
try:
    result = 10 / 0
except ZeroDivisionError as e:
    print(f"Error: {e}")

try:
    x = int("not a number")
except ValueError as e:
    print(f"Conversion error: {e}")

# Custom exception handling
def check_age(age):
    if age < 0:
        raise ValueError("Age cannot be negative")
    return f"Age is {age}"

try:
    print(check_age(-5))
except ValueError as e:
    print(f"Custom error: {e}")
```

## Note on External Packages
Some Python packages like `requests` are not available in Pyodide because:
1. They require system-level networking not available in the browser sandbox
2. They have C dependencies that can't be compiled to WebAssembly

Alternatives:
- Use `pyodide-http` for HTTP requests
- Use `fetch` API via JavaScript interop
- Use built-in Python modules like `urllib.parse` for URL parsing

```python
# Example of JS interop for HTTP requests (advanced)
from js import fetch

# This requires pyodide-http package or custom JavaScript interop
# import pyodide_http
# pyodide_http.patch_all()
```