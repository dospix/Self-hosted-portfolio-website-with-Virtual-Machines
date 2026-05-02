 # Self-hosting my Portfolio Website V2 using VMs

This project is meant as a learning tool in order to familiarize myself with virtual machines. I will be using them to self-host my portfolio website using a 3-tier architecture with VirtualBox Ubuntu Server VMs and Nginx and Gunicorn as servers.

## Architecture

- Web server: Serves a React build of my portfolio website using Nginx
- App server: Uses Gunicorn to run Flask code
- Database server: Uses MySQL to store information (currently just the data used by the task/habit tracker project)

## Tech stack

- VirtualBox with Ubuntu Server VMs
- Nginx
- HTML/CSS(Tailwind)/JavaScript(React)
- Gunicorn
- Python / Flask
- MySQL
- AWS (DynamoDB database used by one of the projects)

## Getting started

- Inside backend folder set up .env based on .env.example
- Inside frontend folder build the React app
- Create a host-only ethernet adapter inside VirtualBox (this project uses 192.168.100.1 as IPv4 address) with DHCP Server enabled
- Create 3 VMs (web-server, app-server, database-server) running Ubuntu Server, make them use a NAT adapter and the host-only adapter
- For each VM eddit /etc/netplan/00-installer-config.yaml with 2 ethernet interfaces: one with dhcp4 enabled and one disabled with a static IP address (this project uses 192.168.100.30 for web-server, .20 for app-server, .10 for database-server)
- For the database server VM: install mysql-server, run mysql_secure_installation, edit /etc/mysql/mysql.conf.d/mysqld.cnf by setting bind-address to 0.0.0.0, restart MySQL, login to MySQL, create database mydb, create user appuser@192.168.100.%, grant privileges for mydb to that user
- For the app server VM: install python and pip, create app folder, copy relevant backend files (server.py, python-site-packages.txt etc.) from the host machine to the VM app folder, create a python venv and pip install from python-site-packages.txt, create service file for Gunicorn at /etc/systemd/system/flask-app.service (can use flask-app.service.example as reference), daemon-reload, enable and start flask-app.service
- For the web server VM: install nginx, enable and start nginx, create app folder, copy build folder contents from the host machine to the VM app folder, eddit default Nginx config at /etc/nginx/sites-available/default (can use nginx_default.example as reference), sudo nginx -t, reload nginx
- Access http://192.168.100.30 from your host machine, you should see the website being live