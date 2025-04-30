# Sequelize Study with Node.js
This project is part of a Node.js study using Sequelize. It demonstrates the power of Sequelize ORM for interacting with a database in a Node.js environment.

## Features
- Basic setup for Sequelize with Node.js.
- Includes CRUD operations for managing data.
- Implements authentication and authorization.

Pre-configured with routes for handling requests to the API.

## Installation & Setup

1. Clone this repository:
* git clone https://github.com/luizcurti/sequelize.git

2. Navigate to the project directory:
* cd sequelize

3. Install dependencies using yarn:
* yarn

Configure your database credentials in src/config/database.js.

1. Create the database:
* yarn sequelize db:create

2. Run the migrations to set up the necessary tables:
* yarn sequelize db:migrate

3. Start the server:
* yarn dev

Import the Insomnia_2019-10-16.json file from the repository into Insomnia to test the API.

## Routes
The API includes routes for managing students, users, and authentication. You can use the Insomnia collection to interact with the endpoints.

* GET /students: List all students.
* POST /students: Create a new student.
* GET /students/:id: Retrieve a single student.
* PUT /students/:id: Update an existing student.
* DELETE /students/:id: Delete a student.

## Contributing
Feel free to fork the repository and submit pull requests for improvements or fixes. Contributions are welcome!