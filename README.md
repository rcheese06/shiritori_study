cd backend  
python build_db.py  
python -m uvicorn main:app --reload --port 8000  
cd ..  
cd frontend  
npm run dev  
