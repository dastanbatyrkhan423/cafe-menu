from cafe_menu.wsgi import application

app = application

# This is the Vercel entry point
if __name__ == '__main__':
    app.run() 