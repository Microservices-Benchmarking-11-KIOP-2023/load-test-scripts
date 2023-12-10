#!/bin/bash

k6 run /scripts/low.js
k6 run /scripts/mid.js
k6 run /scripts/high.js
