# import necessary libraries
# from models import create_classes
import os
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func, or_, inspect
from sqlalchemy.ext.automap import automap_base



from flask import (
    Flask,
    render_template,
    jsonify,
    request,
    redirect)

scrape_engine = create_engine("sqlite:///resources/scrape_db.sqlite")
kaggle_engine = create_engine("sqlite:///resources/cis_2018.sqlite")

# reflect an existing database into a new model
Scrape_Base = automap_base()
Kaggle_Base = automap_base()

# reflect the tables
Scrape_Base.prepare(scrape_engine, reflect=True)
Kaggle_Base.prepare(kaggle_engine, reflect=True)

# Save reference to the table
# print(Scrape_Base.classes.keys())
# print(Kaggle_Base.classes.keys())

scrape_data = Scrape_Base.classes.car_scrape
kaggle_data = Kaggle_Base.classes
# Actors = Base.classes.actors

#################################################
# Flask Setup
#################################################
app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api")
def welcome():
    """List all available api routes."""
    return (
        f"Available Routes:<br/>"
        f"<a href='/api/v1.0/kaggle'>/api/v1.0/kaggle</a><br/>"
        f"<a href='/api/v1.0/stations'>/api/v1.0/stations</a><br/>"
        f"<a href='/api/v1.0/tobs'>/api/v1.0/tobs</a><br/>"
        f"<a>/api/v1.0/&ltstart></a><br/>"
        "/api/v1.0/&ltstart>/&ltend> , dates must be formatted as YYYY-MM-DD (e.g. 1994-04-03)</a><br/>"
    )

@app.route("/api/v1.0/kaggle")
def kaggle():
    """Returns all recorded values of car sale date via kaggle."""
    # Create our session (link) from Python to the DB
    session = Session(kaggle_engine)

    # # Find the most recent date in the data set.
    # sel = [kaggle_data]
    
    # Perform a query to retrieve the data and precipitation scores
    kaggle_list = kaggle_engine.execute("SELECT * FROM sales").fetchall()
   
    inspector = inspect(kaggle_engine)
    columns = inspector.get_columns('sales')
    column_names=[]
    for c in columns:
        column_names.append(c['name'])
    # column_names




    # Firstly, our end goal is to create a list of dictionaries to use in JSONify later for easy plotting
    output_list=[]
    # for the first 10 entries in kaggle_list coming from cis_2018.sqlite database...
    for k in kaggle_list:
        temp_dict={}
    #this is where we assign column rows to their corresponding column names
        for c in range(0,len(column_names)):
            temp_dict[column_names[c]]=k[c]
    #append temp_dict to output_list
        output_list.append(temp_dict)
    output_list



    # Sort the dataframe by date
    
    session.close()
    return (
        jsonify (output_list)
    )


if __name__ == "__main__":
    app.run(debug=True)