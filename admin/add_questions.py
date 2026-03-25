import json
import sys
import os

db_file = '/Users/ivanbegonja/Documents/flashcards-1/quiz/digel_db.json'

def main():
    if not os.path.exists(db_file):
        with open(db_file, 'w') as f:
            json.dump([], f)
    
    new_data = json.loads(sys.stdin.read())
    
    with open(db_file, 'r') as f:
        db = json.load(f)
        
    db.extend(new_data)
    
    with open(db_file, 'w') as f:
        json.dump(db, f, indent=2, ensure_ascii=False)
    
    print(f"Database updated. Total questions: {len(db)}")

if __name__ == '__main__':
    main()
