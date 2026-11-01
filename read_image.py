import cv2
import pytesseract

img = cv2.imread('/tmp/arena-coding-uploads/Screenshot (179).png')
h, w = img.shape[:2]

# The dropdown is somewhere in the center right. Let's just OCR the whole image for now.
text = pytesseract.image_to_string(img, lang='eng+fas')
print(text.encode('utf-8'))
