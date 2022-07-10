import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func
import datetime as dt

from flask import Flask, jsonify
import json

engine = create_engine("sqlite:///Resources/hawaii.sqlite")

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(engine, reflect=True)

# Save references to each table
Measurement = Base.classes.measurement
Station = Base.classes.station



app = Flask(__name__)





@app.route("/")
def welcome():
    """List all available api routes."""
    return (
        f"Available Routes:<br/>"
        f"<a href='/api/v1.0/precipitation'>/api/v1.0/precipitation</a><br/>"
        f"<a href='/api/v1.0/stations'>/api/v1.0/stations</a><br/>"
        f"<a href='/api/v1.0/tobs'>/api/v1.0/tobs</a><br/>"
        f"<a>/api/v1.0/&ltstart></a><br/>"
        "/api/v1.0/&ltstart>/&ltend> , dates must be formatted as YYYY-MM-DD (e.g. 1994-04-03)</a><br/>"
    )

@app.route("/api/v1.0/precipitation")
def precipitation():
    """Returns all recorded values of precipitation for all dates listed."""
    # Create our session (link) from Python to the DB
    session = Session(engine)

    # Find the most recent date in the data set.
    sel = [Measurement.date]
    newest_date = session.query(*sel).order_by(Measurement.date.desc()).first()[0]

    # split string to break out year, mo, day
    nd = newest_date.split('-')
    nd
    # cast strings as int
    for i in range(len(nd)):
        nd[i] = int(nd[i])
    nd
    # store as datetime object
    nd_dt = dt.date(nd[0], nd[1], nd[2])
    nd_dt
    # Calculate the date one year from the last date in data set.
    one_year_previous = nd_dt - dt.timedelta(days=365)
    one_year_previous


    # Perform a query to retrieve the data and precipitation scores
    last_year_list = session.query(Measurement.date, Measurement.prcp).\
        filter(Measurement.date <= newest_date).filter(Measurement.date >= one_year_previous).\
        order_by(Measurement.date).all()
    last_year_list
    last_year_dict = {}
    for (key, value) in last_year_list:
        if key in last_year_dict:
            last_year_dict[key].append(value)
        else:
            last_year_dict[key] = [value]
    last_year_dict
    
    # Sort the dataframe by date
    
    session.close()
    return (
        last_year_dict
    )

@app.route("/api/v1.0/stations")
def stations():
    """Returns a list of all stations from database."""
    # Create our session (link) from Python to the DB
    session = Session(engine)

    stations = session.query(Measurement.station).distinct().order_by(Measurement.station).all()

    stations_dict = {}
    # Adds all stations into a list inside of a dict.  Because value comes in as a tuple of length 1, 
    # it must be converted to string.
    for value in stations:
        key = 'stations'
        if key in stations_dict:
            stations_dict[key].append(value[0])
        else:
            stations_dict[key] = [value[0]]
    
    session.close()
    return stations_dict


@app.route("/api/v1.0/tobs")
def tobs():
    """Query the dates and temperature observations of the most active station for the last year of data."""
    # Create our session (link) from Python to the DB
    session = Session(engine)

    most_active = engine.execute("SELECT station, COUNT(station) \
                                FROM measurement \
                                GROUP BY station\
                                ORDER BY COUNT(station) DESC\
                                ").fetchall()
    
    most_active_id = most_active[0][0]

    sel = [Measurement.date]
    newest_date = session.query(*sel).order_by(Measurement.date.desc()).first()[0]

    # split string to break out year, mo, day
    nd = newest_date.split('-')
    nd
    # cast strings as int
    for i in range(len(nd)):
        nd[i] = int(nd[i])
    nd
    # store as datetime object
    nd_dt = dt.date(nd[0], nd[1], nd[2])
    nd_dt
    # Calculate the date one year from the last date in data set.
    one_year_previous = nd_dt - dt.timedelta(days=365)
    one_year_previous
    
    last_12 = session.query(Measurement.date, Measurement.tobs).filter(Measurement.station == most_active_id).\
        filter(Measurement.date < str(newest_date)).filter(Measurement.date > str(one_year_previous)).all()
    #     columns = ['Date', 'Temp °F']\
    # )
        
    #last_12_df['Date'] = pd.to_datetime(last_12_df['Date'])
    tobs = {}

    for (key, value) in last_12:
        if key in tobs:
            tobs[key].append(value)
        else:
            tobs[key] = [value]


    session.close()
    return tobs

@app.route("/api/v1.0/<start>")
@app.route("/api/v1.0/<start>/<end>")
# = 'now'
def start(start, end = 'now'):
    session = Session(engine)
    
    
    
    if end == 'now':
        lowest  = engine.execute(f"SELECT MIN(tobs) FROM measurement WHERE date >= '{start}'").fetchall()[0][0]
        highest = engine.execute(f"SELECT MAX(tobs) FROM measurement WHERE date >= '{start}'").fetchall()[0][0]
        average = engine.execute(f"SELECT AVG(tobs) FROM measurement WHERE date >= '{start}'").fetchall()[0][0]
    else:
        lowest  = engine.execute(f"SELECT MIN(tobs) FROM measurement WHERE date >= '{start}' AND date <= '{end}'").fetchall()[0][0]
        highest = engine.execute(f"SELECT MAX(tobs) FROM measurement WHERE date >= '{start}' AND date <= '{end}'").fetchall()[0][0]
        average = engine.execute(f"SELECT AVG(tobs) FROM measurement WHERE date >= '{start}' AND date <= '{end}'").fetchall()[0][0]
    
    return {
        'TMIN': lowest,
        'TMAX': highest,
        'TAVG': round(average,2)
    }

    


if __name__ == '__main__':
    app.run(debug=True)