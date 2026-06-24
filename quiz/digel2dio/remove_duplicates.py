#!/usr/bin/env python3
import os
import sys
import json
import argparse
import shutil
from collections import defaultdict

def normalize_text(text):
    """Normalize text for robust comparison by stripping whitespace,
    lowering case, and removing trailing punctuation."""
    if not text:
        return ""
    # Lowercase and strip whitespace
    normalized = text.strip().lower()
    # Remove trailing punctuation
    while normalized and normalized[-1] in ('?', '.', '!', ':', ';', ','):
        normalized = normalized[:-1]
    return normalized.strip()

def is_valid_index(correct, answers):
    """Check if 'correct' is a valid 0-based index for the 'answers' list."""
    if not answers:
        return False
    try:
        idx = int(correct)
        return 0 <= idx < len(answers)
    except (ValueError, TypeError):
        return False

def score_item(item):
    """Score an item to determine its quality. Higher score is better.
    - Multiple-choice questions are preferred over free-text questions.
    - Multiple-choice questions with valid indices are preferred.
    - Questions with more answer choices are preferred.
    - More detailed (longer) correct answers or questions are preferred.
    """
    score = 0
    answers = item.get("answers", [])
    correct = item.get("correct", "")
    question = item.get("question", "")
    
    # 1. Multiple-choice vs Free-text
    if answers and len(answers) > 0:
        score += 1000
        # 2. Valid index check
        if is_valid_index(correct, answers):
            score += 500
        # 3. Number of choices
        score += len(answers) * 10
    else:
        # Free-text: prefer longer, more descriptive correct answers
        if isinstance(correct, str):
            score += len(correct.strip())
            
    # 4. Length of question (slight tie-breaker for more complete text)
    score += len(question) * 0.1
    return score

def resolve_clash_automatically(group, question_text):
    """Select the best item from a group of duplicates using heuristics."""
    # Sort by score descending, and use original index as a tie-breaker (keep earlier ones)
    sorted_group = sorted(group, key=lambda x: (score_item(x['item']), -x['original_index']), reverse=True)
    best_option = sorted_group[0]
    return best_option['item'], sorted_group

def resolve_clash_interactively(group, question_text):
    """Prompt the user to choose which item to keep."""
    print(f"\n==================================================")
    print(f"CLASH DETECTED FOR QUESTION:")
    print(f"'{question_text}'")
    print(f"==================================================")
    
    for i, opt in enumerate(group):
        item = opt['item']
        orig_idx = opt['original_index']
        print(f"\n[{i + 1}] Original Line/Index: ~{orig_idx}")
        print(f"    Answers: {item.get('answers')}")
        print(f"    Correct: {item.get('correct')} (Type: {type(item.get('correct')).__name__})")
        print(f"    Score:   {score_item(item):.1f}")
        
    while True:
        try:
            choice = input(f"\nSelect option to keep (1-{len(group)}) or 's' to use auto-selected default: ").strip().lower()
            if choice == 's':
                best_item, _ = resolve_clash_automatically(group, question_text)
                return best_item
            val = int(choice)
            if 1 <= val <= len(group):
                return group[val - 1]['item']
        except ValueError:
            pass
        print(f"Invalid input. Please enter a number between 1 and {len(group)}, or 's'.")

def deduplicate_quiz(input_path, output_path, interactive=False, dry_run=False, create_backup=True):
    if not os.path.exists(input_path):
        print(f"Error: Input file '{input_path}' does not exist.")
        return False
        
    with open(input_path, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError as e:
            print(f"Error: Failed to parse JSON file: {e}")
            return False

    if not isinstance(data, list):
        print("Error: JSON root must be a list of question objects.")
        return False

    print(f"Loaded {len(data)} items from '{input_path}'.")

    # Group items by normalized question text
    grouped_items = defaultdict(list)
    for idx, item in enumerate(data):
        q = item.get("question", "")
        norm_q = normalize_text(q)
        grouped_items[norm_q].append({
            "original_index": idx,
            "item": item
        })

    unique_questions = []
    exact_duplicates_count = 0
    clashes_resolved_count = 0
    clashes_found = 0

    for norm_q, group in grouped_items.items():
        if len(group) == 1:
            unique_questions.append(group[0]['item'])
            continue

        # Check for exact duplicates within the group
        unique_in_group = []
        seen_serialized = set()
        for opt in group:
            # Serialize for exact match check
            serialized = json.dumps(opt['item'], sort_keys=True, ensure_ascii=False)
            if serialized not in seen_serialized:
                seen_serialized.add(serialized)
                unique_in_group.append(opt)
            else:
                exact_duplicates_count += 1

        if len(unique_in_group) == 1:
            # All duplicates were exact copies
            unique_questions.append(unique_in_group[0]['item'])
        else:
            # We have a clash (same question text, different answers/correct values)
            clashes_found += 1
            question_text = group[0]['item'].get("question", "")
            
            if interactive:
                selected_item = resolve_clash_interactively(unique_in_group, question_text)
                clashes_resolved_count += 1
            else:
                selected_item, sorted_opts = resolve_clash_automatically(unique_in_group, question_text)
                clashes_resolved_count += 1
                # Log the auto-selection details for transparency
                best_score = score_item(selected_item)
                print(f"\nAuto-resolved clash for: '{question_text}'")
                print(f"  Selected index ~{sorted_opts[0]['original_index']} (Score: {best_score:.1f})")
                print(f"  Discarded: {len(sorted_opts) - 1} other variant(s)")

            unique_questions.append(selected_item)

    print("\n==================================================")
    print("DEDUPLICATION SUMMARY")
    print("==================================================")
    print(f"Original item count:     {len(data)}")
    print(f"Exact duplicates removed: {exact_duplicates_count}")
    print(f"Different variants (clashes) resolved: {clashes_resolved_count}")
    print(f"Final unique item count:  {len(unique_questions)}")
    print("==================================================")

    if dry_run:
        print("\n[Dry Run] No changes were written to disk.")
        return True

    # Write output
    if create_backup and input_path == output_path:
        backup_path = input_path + ".bak"
        print(f"Creating backup of original file at '{backup_path}'...")
        shutil.copy2(input_path, backup_path)

    print(f"Writing deduplicated JSON to '{output_path}'...")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(unique_questions, f, indent=4, ensure_ascii=False)
    print("Successfully completed.")
    return True

def main():
    parser = argparse.ArgumentParser(description="Remove duplicate questions from a quiz JSON file.")
    parser.add_argument(
        "-i", "--input", 
        default="quiz.json",
        help="Path to the input JSON file (default: quiz.json)"
    )
    parser.add_argument(
        "-o", "--output",
        help="Path to the output JSON file (default: same as input, overwriting it)"
    )
    parser.add_argument(
        "-int", "--interactive",
        action="store_true",
        help="Enable interactive mode to manually resolve clashes"
    )
    parser.add_argument(
        "-d", "--dry-run",
        action="store_true",
        help="Perform a dry run without modifying any files"
    )
    parser.add_argument(
        "--no-backup",
        action="store_true",
        help="Do not create a backup file before overwriting"
    )

    args = parser.parse_args()

    # Resolve paths relative to current working directory if not absolute
    input_path = os.path.abspath(args.input)
    output_path = os.path.abspath(args.output) if args.output else input_path
    create_backup = not args.no_backup

    deduplicate_quiz(
        input_path=input_path,
        output_path=output_path,
        interactive=args.interactive,
        dry_run=args.dry_run,
        create_backup=create_backup
    )

if __name__ == "__main__":
    main()
