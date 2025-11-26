# Introduction to AI-Assisted Development 

In this homework, we'll build an application with AI.

You can use any tool you want: ChatGPT, Claude, GitHub Copilot, Codex, Cursor, Antigravity, etc.

With chat-based applications you will need to copy code back-and-forth, so we recommend that you use an AI assistant in your IDE with agent mode.

We will build a TODO application in Django.

The app should be able to do the following:
- Create, edit and delete TODOs 
- Assign due dates
- Mark TODOs as resolved

You will only need Python to get started. 
You don't need to know Python or Django for doing this homework.

## Question 1: Install Django
We want to install Django with command line is:
```bash
python -m pip install Django
```


## Question 2: Project and App

Now we need to create a project and an app for that.

Follow the instructions from [Project Setup](README.md)

What's the file you need to edit for that?

- **`settings.py` => Choose this file need to edit**
- `manage.py`
- `urls.py`
- `wsgi.py`


## Question 3: Django Models

Let's now proceed to creating models - the mapping from python objects to a relational database. For the TODO app, which models do we need? Implement them.

What's the next step you need to take?
- Run the application
- Add the models to the admin panel
- **Run migrations => Choose this step need to take**
- Create a makefile


## Question 4. TODO Logic
Let's now ask AI to implement the logic for the TODO app. Where do we put it? 
- **`views.py` => Choose this file we put it**
- `urls.py`
- `admin.py`
- `tests.py`


## Question 5. Templates
Next step is creating the templates. You will need at least two: the base one and the home one. Let's call them `base.html` and `home.html`.

Where do you need to register the directory with the templates? 

- `INSTALLED_APPS` in project's `settings.py`
- **`TEMPLATES['DIRS']` in project's `settings.py` => Choose this answer need to register the directory**
- `TEMPLATES['APP_DIRS']` in project's `settings.py`
- In the app's `urls.py`

## Question 6. Tests
Probably it will require a few iterations to make sure that tests pass and evertyhing is working. 

What's the command you use for running tests in the terminal? 
- `pytest`
- **`python manage.py test` => Choose this command**
- `python -m django run_tests`
- `django-admin test`

## Running the app

Now the application is developed and tested. Run it:

```bash
python manage.py runserver
```

## Tips
You can copy-paste the homework description into the AI system of your choice. But make sure you understand (and follow) all the steps in the response.
