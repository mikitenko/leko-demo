#!/bin/bash
# Build frontend and copy to backend/public

cd frontend
npm install
npm run build
cd ..

cd backend
npm install
rm -rf public
cp -r ../frontend/dist public
cd ..
