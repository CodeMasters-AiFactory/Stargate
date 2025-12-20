# Smoke Test Rules for Merlin Website Wizard

## When user says "test" or "smoke test", follow these rules:

1. **Start Fresh**: Always clear all data and start from the beginning (home page)
2. **Speed**: Move immediately after selection/writing - NO delays between actions
3. **Visual Cursor**: Show cursor movement (use browser automation with visible feedback)
4. **Dropdown Menus**: Select options immediately - don't wait or hesitate
5. **Auto Error Check**: After each step, automatically check for errors/validation issues
6. **Complete Flow**: Complete the ENTIRE wizard from start to finish automatically
7. **Random Options**: Choose random but sensible options that make sense for the context
8. **Company Name**: Use "Merlin development solutions" or "tec" as specified
9. **No Manual Delays**: Remove all wait times - move as fast as possible
10. **Error Detection**: Check console, validation messages, and page state after each action

## Test Flow:
1. Navigate to home
2. Click "Merlin Websites"
3. Select random package (Essential/Professional/SEO/Deluxe/Ultra)
4. Select random site type (Personal/Business/Corporate/E-commerce)
5. Choose Auto Mode
6. Fill Project Overview with random but relevant description
7. Complete Business Details with random sensible values
8. Add random services/products
9. Complete Branding with random color/style choices
10. Continue through all remaining pages
11. Complete entire wizard
12. Verify final website generation

## Random Selection Examples:
- Industry: Random from available options
- Website Type: Random but matches business type
- Colors: Random but professional
- Design Style: Random from available
- Font: Random from available
- Services: 1-3 random services with descriptions

