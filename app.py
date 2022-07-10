# import necessary libraries
# from models import create_classes
import os
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func, or_, inspect
from sqlalchemy.ext.automap import automap_base
from datetime import date



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

scrape_data = Scrape_Base.classes
kaggle_data = Kaggle_Base.classes
# Actors = Base.classes.actors

#################################################
# Flask Setup
#################################################
app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

# LIST ALL AVAILABLE ROUTES
@app.route("/api")
def welcome():
    """List all available api routes."""
    return (
        f"<h2>Available Routes:<h2/><hr>"
        
        f"<h4>Return first 1,000 of all results:</h4><a href='/api/v1.0/kaggle'>/api/v1.0/kaggle</a><br/><hr><br>"
        f"<h4>Returns all unique makes in kaggle:</h4><a href='/api/v1.0/kaggle/makes'>/api/v1.0/kaggle/makes</a><br/><hr><br>"
        f"<h4>Returns all results from Cargurus Scraped Data:<h4><a href='/api/v1.0/scraped'>/api/v1.0/scraped</a><br/><hr><br>"
        f"<h4>Returns all unique makes in Cargurus Scraped Data:</h4><a href='/api/v1.0/scraped/makes'>/api/v1.0/scraped/makes</a><br/><hr><br>"
        "/api/v1.0/&ltstart>/&ltend> , dates must be formatted as YYYY-MM-DD (e.g. 1994-04-03)</a><br/>"
    )


# LIST 1ST 1000 VEHICLES OF ALL.  157,000 ROWS TAKES TOO LONG TO BUILD
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
    for k in kaggle_list[0:1000]:
        temp_dict={}
    #this is where we assign column rows to their corresponding column names
        for c in range(0,len(column_names)):
            temp_dict[column_names[c]]=k[c]
    #append temp_dict to output_list
        output_list.append(temp_dict)
    output_list

    
    session.close()
    return (
        jsonify (output_list)
    )









# LIST ALL MAKES FROM KAGGLE DATA
@app.route("/api/v1.0/kaggle/makes")
def kagglemakes():
    """Returns all recorded values of car sale date via kaggle."""
    # Create our session (link) from Python to the DB
    session = Session(kaggle_engine)

    # # Find the most recent date in the data set.
    # sel = [kaggle_data]
    
    # Perform a query to retrieve the data and precipitation scores
    kaggle_list = kaggle_engine.execute("SELECT DISTINCT make FROM sales").fetchall()
   
    inspector = inspect(kaggle_engine)
    columns = inspector.get_columns('sales')
    column_names=[]
    for c in columns:
        if c['name'] == 'make':
            column_names.append(c['name'])
    # column_names




    # Firstly, our end goal is to create a list of dictionaries to use in JSONify later for easy plotting
    output_list=[]
    # for the first 10 entries in kaggle_list coming from cis_2018.sqlite database...
    for k in kaggle_list[0:1000]:
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









# THIS IS THE ROUTE THAT DISPLAYS ALL OF THE CARGURUS SCRAPED DATA
@app.route("/api/v1.0/scraped")
def scraped():
    """Returns all recorded values of car sale data via cargurus scraping."""
    # Create our session (link) from Python to the DB
    session = Session(scrape_engine)

    # # Find the most recent date in the data set.
    # sel = [kaggle_data]
    
    # Perform a query to retrieve the data and precipitation scores
    scrape_list = scrape_engine.execute("SELECT * FROM car_scrape").fetchall()
   
    inspector = inspect(scrape_engine)
    columns = inspector.get_columns('car_scrape')
    column_names=[]
    for c in columns:
        column_names.append(c['name'])
    # column_names




    # Firstly, our end goal is to create a list of dictionaries to use in JSONify later for easy plotting
    output_list=[]
    # for the first 10 entries in kaggle_list coming from cis_2018.sqlite database...
    for s in scrape_list:
        temp_dict={}
    #this is where we assign column rows to their corresponding column names
        for c in range(0,len(column_names)):
            temp_dict[column_names[c]]=s[c]
    #append temp_dict to output_list
        output_list.append(temp_dict)
    output_list



    # create list of features for geojson
    features = []
    for o in output_list:
        f_dict = {
            "type": "Feature",
            "properties": o,
            "geometry": {
                "type": "Point",
                "coordinates": [
                    o['lat'],
                    o['lng']
                ],
            },
            'id': o['vin']
        }
        features.append(f_dict)

    output_dict = {
        "type": "FeatureCollection",
        'metadata': {
            "generated": date.today(),
            "url": "https://gouge-data.herokuapp.com/api/v1.0/scraped",
            "title": "gouge-data all scraped cars",
            "status": 200,
            "api": "1.0",
            "count": len(output_list)
        },
        'features': features
    }
    
    session.close()
    return (
        jsonify (output_dict)
    )









 # LIST ALL MAKES FROM CAR SCRAPED DATA
@app.route("/api/v1.0/scraped/makes")
def scrapemakes():
    """Returns all recorded values of car sale date via scraped_db."""
    # Create our session (link) from Python to the DB
    session = Session(scrape_engine)

    # # Find the most recent date in the data set.
    # sel = [kaggle_data]
    
    # Perform a query to retrieve the data and precipitation scores
    scrape_list = scrape_engine.execute("SELECT DISTINCT make FROM car_scrape").fetchall()
   
    inspector = inspect(scrape_engine)
    columns = inspector.get_columns('car_scrape')
    column_names=[]
    for c in columns:
        if c['name'] == 'make':
            column_names.append(c['name'])
    # column_names




    # Firstly, our end goal is to create a list of dictionaries to use in JSONify later for easy plotting

    # output_list=[]
    # for k in scrape_list:
    #     temp_dict={}

    #this is where we assign column rows to their corresponding column names

        # for c in range(0,len(column_names)):
        #     temp_dict[column_names[c]]=k[c]

    #append temp_dict to output_list

    #     output_list.append(temp_dict)
    # output_list


    # Sort the dataframe by date

    session.close()
    return (
        # jsonify (output_list)
        jsonify ({
            'make': scrape_list
        })
    )










if __name__ == "__main__":
    app.run(debug=True)