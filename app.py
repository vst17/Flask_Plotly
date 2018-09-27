import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func, desc
from flask import Flask, jsonify, render_template, request
import csv

# Create App
app = Flask(__name__)

# Connect to sqlite database
engine = create_engine("sqlite:///datasets/belly_button_biodiversity.sqlite")
Base = automap_base()
Base.prepare(engine, reflect=True)
session = Session(engine)

# Storing tables
Otu = Base.classes.otu
Samples = Base.classes.samples
Samples_Metadata = Base.classes.samples_metadata

# Returns the dashboard homepage
@app.route("/")
def home():
    return render_template("index.html")

# Returns a list of sample names in list format
@app.route("/names")
def names():

    # Empty list for sample ids
    sample_ids = []
    
    # Grab metadata table
    results = session.query(Samples_Metadata.SAMPLEID)

    # Loop through query & grab ids
    for result in results:
        sample_ids.append("BB_" + str(result[0]))

    return jsonify(sample_ids)

# Returns a list of OTU descriptions
@app.route("/otu")
def otu():

    # Empty list for descriptions
    otu_desc = []
    
    # Grab otu table
    results = session.query(Otu.lowest_taxonomic_unit_found)

    # Loop through query & grab descriptions
    for result in results:
        otu_desc.append(result[0])

    return jsonify(otu_desc)

# Returns a json dictionary of sample metadata
@app.route("/metadata/<sample>")
def metadata(sample):
    
    # Grab input
    sample_id = int(sample.split("_")[1])

    # Empty dictionary for data
    sample_metadata = {}

    # Grab metadata table
    samples = session.query(Samples_Metadata)

    # Loop through query & grab info
    for info in samples:
        if (sample_id == info.SAMPLEID):
            sample_metadata["AGE"] = info.AGE
            sample_metadata["BBTYPE"] = info.BBTYPE
            sample_metadata["ETHNICITY"] = info.ETHNICITY
            sample_metadata["GENDER"] = info.GENDER
            sample_metadata["LOCATION"] = info.LOCATION
            sample_metadata["SAMPLEID"] = info.SAMPLEID

    return jsonify(sample_metadata)

# Returns an integer value for the weekly washing frequency
@app.route("/wfreq/<sample>")
def wfreq(sample):

    # Grab input
    sample_id = int(sample.split("_")[1])

    # Grab metadata table
    results = session.query(Samples_Metadata)

    # Loop through and grab wfreq
    for result in results:
        if (sample_id == result.SAMPLEID):
            wfreq = result.WFREQ

    return jsonify(wfreq)

# Returns a list of dictionaries containing sorted lists for 'otu_ids' and 'sample_values'
@app.route("/samples/<sample>")
def samples(sample):

    # Create sample query
    sample_query = "Samples." + sample

    # Create empty dictionary & lists
    samples_info = {}
    otu_ids = []
    sample_values = []

    # Grab info
    results = session.query(Samples.otu_id, sample_query).order_by(desc(sample_query))

    # Loop through & append
    for result in results:
        otu_ids.append(result[0])
        sample_values.append(result[1])

    # Add to dictionary
    samples_info = {
        "otu_ids": otu_ids,
        "sample_values": sample_values
    }

    return jsonify(samples_info)
    

if __name__ == "__main__":
    app.run(debug=True)