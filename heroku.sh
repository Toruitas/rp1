#!/bin/bash
gunicorn rp1:app --daemon
python worker.py
