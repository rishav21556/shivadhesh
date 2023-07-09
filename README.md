# Shivadhesh E-commerce Website

This is the official repository for the Shivadhesh E-commerce website, a full-stack web application built using HTML, CSS, JavaScript, Bootstrap, Django, and Python.

The goal of this project is to create a robust and feature-rich e-commerce website called Shivadhesh that addresses the following challenges:

1. **User-friendly Interface**: Design and develop an intuitive and visually appealing user interface that ensures easy navigation and enhances the overall user experience.

2. **Product Catalog**: Implement a comprehensive product catalog with appropriate categorization, enabling users to browse and search for products effortlessly.

3. **Shopping Cart**: Develop a shopping cart functionality that allows users to add products, update quantities, and proceed to checkout seamlessly.

4. **Secure Payments**: Implement a secure payment gateway integration to enable customers to make safe and convenient transactions.

5. **Order Management**: Create a system for managing and tracking orders, including order placement, status updates, and order history for both users and administrators.

6. **User Authentication**: Implement user authentication and authorization mechanisms to ensure secure access to user-specific features such as order history, wishlists, and account settings.

## Project Structure

The project follows a standard Django project structure, consisting of the following main components:

- **`shivadhesh`**: This is the Django project's main directory that holds the project-level configuration files and settings.

- **`products`**: This directory contains the Django app responsible for managing the product catalog, including models, views, templates, and URLs.

- **`cart`**: This directory contains the Django app responsible for managing the shopping cart functionality.

- **`orders`**: This directory contains the Django app responsible for managing orders and order-related functionalities.

- **`accounts`**: This directory contains the Django app responsible for user authentication and account management.

- **`templates`**: This directory holds the HTML templates used for rendering the web pages.

- **`static`**: This directory contains static files such as CSS, JavaScript, and images.

- **`manage.py`**: This is the entry point script for Django's management commands.

## Installation and Setup

To set up the Shivadhesh E-commerce website locally, follow these steps:

1. Clone this repository: `git clone <repository_url>`.
2. Install Python (if not already installed) from the official website: https://www.python.org/downloads/
3. Create a virtual environment: `python -m venv myenv` (replace `myenv` with the desired name).
4. Activate the virtual environment:
   - On Windows: `myenv\Scripts\activate`
   - On macOS and Linux: `source myenv/bin/activate`
5. Navigate to the project directory: `cd shivadhesh`.
6. Install the project dependencies: `pip install -r requirements.txt`.
7. Run database migrations: `python manage.py migrate`.
8. Start the development server: `python manage.py runserver`.
9. Access the website at: `http://127.0.0.1:8000/users/home/All/`.

## Contact

For any inquiries or feedback, please contact the project maintainer:

- Rishav Raj - rishav21556@iiitd.ac.in

Feel free to open an issue if you encounter any problems or have suggestions for improvement.

We hope you find the Shivadhesh E-commerce website useful and enjoy using it!

Happy shopping!
