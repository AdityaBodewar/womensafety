from application import app
import os
from dotenv import load_dotenv

load_dotenv()
port=os.getenv("PORT")


if __name__=="__main__":
    app.run(host="0.0.0.0", port=port,)