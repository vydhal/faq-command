# Deployment Guide for Hostinger

This project uses a React frontend (Vite) and a PHP/SQLite backend.

## Prerequisites

- Hostinger account with PHP support.
- SQLite extension enabled in PHP settings (usually on by default).

## Steps

1.  **Build the Frontend**
    Run the build command to generate the static files:
    ```bash
    npm run build
    ```
    This will create a `dist` folder.

2.  **Prepare Backend Files**
    Copy the `api` folder into the `dist` folder.
    So you should have `dist/api`.

3.  **Upload to Hostinger**
    - Upload the contents of the `dist` folder to your `public_html` directory on Hostinger.
    - Ensure `api` folder is inside `public_html`.

4.  **Database Setup**
    - You can upload the local `database.sqlite` file to `public_html` (or the root directory).
    - OR, you can run the setup script on the server:
        - Access `https://yourdomain.com/api/setup_db.php` in your browser.
        - This will create `database.sqlite` and seed it with initial data.
    - **Important:** Ensure the folder containing `database.sqlite` (usually `public_html`) has write permissions so PHP can write to the database file.

5.  **Security Note**
    - It is recommended to block direct access to `database.sqlite`.
    - You can add a `.htaccess` file in `public_html` with:
      ```apache
      <Files "database.sqlite">
          Order allow,deny
          Deny from all
      </Files>
      ```

## Local Development

To run locally:
1.  Start the PHP server:
    ```bash
    php -S localhost:8000 -t . -c php.ini
    ```
2.  Start the Vite dev server:
    ```bash
    npm run dev
    ```
3.  The app will try to connect to `http://localhost:8000/api`.
