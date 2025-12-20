# 📦 Instructions for Copying to USB Stick

## What to Copy

Copy the **ENTIRE** `StargatePortal` folder to your USB stick. This includes:

- All source code
- `node_modules` folder (if you want to save time)
- `BOARDROOM_SETUP` folder (with all instructions)
- All configuration files

## Recommended: Copy Everything

**Option 1: Full Copy (Recommended)**

- Copy entire `StargatePortal` folder
- Includes `node_modules` (faster setup on other PC)
- Size: ~500MB-1GB

**Option 2: Code Only (Faster Copy)**

- Copy entire `StargatePortal` folder EXCEPT `node_modules`
- Run `npm install` on boardroom PC
- Size: ~50-100MB

## Steps

1. **Insert USB stick** into this PC

2. **Copy folder:**

   ```powershell
   # Find your USB drive letter (usually D:, E:, F:, etc.)
   # Then copy:
   xcopy "C:\CURSOR PROJECTS\StargatePortal" "E:\StargatePortal" /E /I /H
   # Replace E: with your USB drive letter
   ```

3. **Verify copy:**
   - Check that `BOARDROOM_SETUP` folder exists on USB
   - Check that `package.json` exists
   - Check that `node_modules` exists (if you copied it)

4. **On Boardroom PC:**
   - Copy folder from USB to local drive (faster than running from USB)
   - Open `BOARDROOM_SETUP` folder
   - Read `START_HERE.txt`
   - Follow instructions

## Important Notes

- **Don't copy while server is running** - Close any running processes first
- **USB speed matters** - If slow, exclude `node_modules` and install on other PC
- **Check free space** - Need at least 1GB free on USB
- **Verify after copy** - Make sure all files copied successfully

## Quick Copy Command

```powershell
# Replace D: with your USB drive letter
robocopy "C:\CURSOR PROJECTS\StargatePortal" "D:\StargatePortal" /E /COPYALL /R:3 /W:5
```

This will:

- Copy everything (`/E` = all subdirectories)
- Copy all attributes (`/COPYALL`)
- Retry 3 times on errors (`/R:3`)
- Wait 5 seconds between retries (`/W:5`)

## After Copying

On the boardroom PC:

1. Copy folder from USB to local drive (e.g., `C:\StargatePortal`)
2. Open `BOARDROOM_SETUP` folder
3. Read `START_HERE.txt`
4. Run `QUICK_START.ps1`

## Troubleshooting

**Problem: Copy is too slow**

- Exclude `node_modules` folder
- Run `npm install` on boardroom PC instead

**Problem: Not enough space**

- Exclude `node_modules` folder
- Exclude `.git` folder if exists
- Exclude any large log files

**Problem: Files won't copy**

- Check USB is not write-protected
- Try different USB port
- Format USB if corrupted
