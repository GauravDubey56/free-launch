#!/bin/bash

echo "Running ironman: Orchestrator"
cd ironman
npm run dev


echo "Running thor: worker to handle deployment jobs"
cd ../thor
npm run dev

echo "Application is running..."