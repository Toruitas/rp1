from flask import Flask, render_template, request, jsonify
from flask.ext.sqlalchemy import SQLAlchemy
from collections import Counter
from bs4 import BeautifulSoup
import operator
import requests
import os
import re
import nltk
import json
from rq import Queue
from rq.job import Job
from worker import conn

from stop_words import stops

###configuration & creation
from config import configs
app = Flask(__name__)
config_name = os.getenv('FLASK_CONFIG') or 'default'
app.config.from_object(configs[config_name])
db = SQLAlchemy(app)
q = Queue(connection=conn)  # connection to redis and initializes queue on it
from models import Result


##############Helper###################

def count_and_save_words(url):
    errors = []

    try:
        r = requests.get(url)
    except:
        errors.append(
            "Unable to get URL. Please make sure it's valid and try again."
        )
        return {"error": errors}

    # text processing
    raw = BeautifulSoup(r.text,"html.parser").get_text()
    nltk.data.path.append('./nltk_data/')  # set the path
    tokens = nltk.word_tokenize(raw)
    text = nltk.Text(tokens)

    # remove punctuation, count raw words
    nonPunct = re.compile('.*[A-Za-z].*')
    raw_words = [w for w in text if nonPunct.match(w)]
    raw_word_count = Counter(raw_words)

    # stop words
    no_stop_words = [w for w in raw_words if w.lower() not in stops]
    no_stop_words_count = Counter(no_stop_words)

    # save the results
    try:
        result = Result(
            url=url,
            result_all=raw_word_count,
            result_no_stop_words=no_stop_words_count
        )
        db.session.add(result)
        db.session.commit()
        return result.id
    except:
        errors.append("Unable to add item to database.")
        return {"error": errors}


#################### Routes #####################
@app.route('/', methods=['GET', 'POST'])
def index():
    return render_template('index.html')

@app.route("/results/<job_key>", methods=['GET'])
def get_results(job_key):
    """
    Checks on job with <job_key> as the id, and if it is finished, finds the results in the DB and shows JSON version.
    Problem: will only fetch if within 5000 seconds. After, there's no way to get it from DB!
    :param job_key:
    :return:
    """

    job = Job.fetch(job_key, connection=conn)  # this will

    if job.is_finished:
        result = Result.query.filter_by(id=job.result).first()
        results = sorted(
            result.result_no_stop_words.items(),
            key=operator.itemgetter(1),
            reverse=True
        )[:10]
        return jsonify(results)
    else:
        return "Nay!", 202

@app.route("/start", methods=['POST'])
def get_counts():
    # get url
    data = json.loads(request.data.decode())
    url = data["url"]
    # form url, id necessary
    if 'http://' not in url:
        url = 'http://'+url
    # start job
    job = q.enqueue_call(func=count_and_save_words,args=(url,), result_ttl=5000)
    return job.get_id()

# @app.route("/p", methods=['POST'])
# def p():
#     data=json.loads(request.data.decode())
#     import time
#     time.sleep(2)
#     print(data["whoa"])
#     return data['whoa']


if __name__ == '__main__':
    app.run(debug=True)
