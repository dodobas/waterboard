# -*- coding: utf-8 -*-
import time

import requests

picture_links = [
"https://majellaglobal.appspot.com/imageViewer?blobKey=ag9zfm1hamVsbGFnbG9iYWxyEwsSCmJsb2Jfc3RvcmUY8YyEOgw&blobName=tigraywb$$11222012075020$$Published$$9530$$P$$Well_Log_Design_254.jpg",
"https://majellaglobal.appspot.com/imageViewer?blobKey=ag9zfm1hamVsbGFnbG9iYWxyEwsSCmJsb2Jfc3RvcmUYw8nyOgw&blobName=tigraywb$$11222012075020$$Published$$9531$$P$$Well_Log_Design_255.jpg",
"https://majellaglobal.appspot.com/imageViewer?blobKey=ag9zfm1hamVsbGFnbG9iYWxyEwsSCmJsb2Jfc3RvcmUYgav8QQw&blobName=tigraywb$$11222012075020$$Published$$56853$$P$$Well_Log_Design_609.jpg",
"https://majellaglobal.appspot.com/imageViewer?blobKey=ag9zfm1hamVsbGFnbG9iYWxyEwsSCmJsb2Jfc3RvcmUYwbyOQQw&blobName=tigraywb$$11222012075020$$Published$$56854$$P$$Well_Log_Design_610.jpg",
"https://majellaglobal.appspot.com/imageViewer?blobKey=ag9zfm1hamVsbGFnbG9iYWxyEwsSCmJsb2Jfc3RvcmUY8dz7QQw&blobName=tigraywb$$11222012075020$$Published$$56855$$P$$Well_Log_Design_611.jpg",
"https://majellaglobal.appspot.com/imageViewer?blobKey=ag9zfm1hamVsbGFnbG9iYWxyEwsSCmJsb2Jfc3RvcmUY0djvQgw&blobName=tigraywb$$11222012075020$$Published$$56856$$P$$612.jpg",
"https://majellaglobal.appspot.com/imageViewer?blobKey=ag9zfm1hamVsbGFnbG9iYWxyEwsSCmJsb2Jfc3RvcmUY8Y_uQAw&blobName=tigraywb$$11222012075020$$Published$$59000$$P$$Well_Log_Design_254.jpg",
"https://majellaglobal.appspot.com/imageViewer?blobKey=ag9zfm1hamVsbGFnbG9iYWxyEwsSCmJsb2Jfc3RvcmUYocaqQQw&blobName=tigraywb$$11222012075020$$Published$$59008$$P$$618.jpg",
"https://majellaglobal.appspot.com/imageViewer?blobKey=ag9zfm1hamVsbGFnbG9iYWxyEwsSCmJsb2Jfc3RvcmUYoZSLQww&blobName=tigraywb$$11222012075020$$Published$$59009$$P$$617.jpg",
"https://majellaglobal.appspot.com/imageViewer?blobKey=ag9zfm1hamVsbGFnbG9iYWxyEwsSCmJsb2Jfc3RvcmUY8b_YQgw&blobName=tigraywb$$11222012075020$$Published$$59010$$P$$620.jpg",
"https://majellaglobal.appspot.com/imageViewer?blobKey=ag9zfm1hamVsbGFnbG9iYWxyEwsSCmJsb2Jfc3RvcmUYobv7Qww&blobName=tigraywb$$11222012075020$$Published$$59011$$P$$619.jpg",
"https://majellaglobal.appspot.com/imageViewer?blobKey=ag9zfm1hamVsbGFnbG9iYWxyEwsSCmJsb2Jfc3RvcmUYweKrQQw&blobName=tigraywb$$11222012075020$$Published$$59012$$P$$621.jpg",
"https://majellaglobal.appspot.com/imageViewer?blobKey=ag9zfm1hamVsbGFnbG9iYWxyEwsSCmJsb2Jfc3RvcmUY4dDZRQw&blobName=tigraywb$$11222012075020$$Published$$59052$$P$$622.jpg",
"https://majellaglobal.appspot.com/imageViewer?blobKey=ag9zfm1hamVsbGFnbG9iYWxyEwsSCmJsb2Jfc3RvcmUYsfymRQw&blobName=tigraywb$$11222012075020$$Published$$59053$$P$$623.jpg",
"https://majellaglobal.appspot.com/imageViewer?blobKey=ag9zfm1hamVsbGFnbG9iYWxyEwsSCmJsb2Jfc3RvcmUY4eaoRQw&blobName=tigraywb$$11222012075020$$Published$$59054$$P$$624.jpg",
"https://majellaglobal.appspot.com/imageViewer?blobKey=ag9zfm1hamVsbGFnbG9iYWxyEwsSCmJsb2Jfc3RvcmUY0rvMQww&blobName=tigraywb$$11222012075020$$Published$$59055$$P$$625.jpg",
"https://majellaglobal.appspot.com/imageViewer?blobKey=ag9zfm1hamVsbGFnbG9iYWxyEwsSCmJsb2Jfc3RvcmUY0ZioRQw&blobName=tigraywb$$11222012075020$$Published$$59056$$P$$626.jpg",
"https://majellaglobal.appspot.com/imageViewer?blobKey=ag9zfm1hamVsbGFnbG9iYWxyEwsSCmJsb2Jfc3RvcmUYgu3aRQw&blobName=tigraywb$$11222012075020$$Published$$59057$$P$$627.jpg",
"https://majellaglobal.appspot.com/imageViewer?blobKey=ag9zfm1hamVsbGFnbG9iYWxyEwsSCmJsb2Jfc3RvcmUYwcqnRQw&blobName=tigraywb$$11222012075020$$Published$$59058$$P$$628.jpg",
"https://majellaglobal.appspot.com/imageViewer?blobKey=ag9zfm1hamVsbGFnbG9iYWxyEwsSCmJsb2Jfc3RvcmUYkbm1RAw&blobName=tigraywb$$11222012075020$$Published$$59059$$P$$629.jpg",
"https://majellaglobal.appspot.com/imageViewer?blobKey=ag9zfm1hamVsbGFnbG9iYWxyEwsSCmJsb2Jfc3RvcmUYk7m1RAw&blobName=tigraywb$$11222012075020$$Published$$59062$$P$$630.jpg",
"https://majellaglobal.appspot.com/imageViewer?blobKey=ag9zfm1hamVsbGFnbG9iYWxyEwsSCmJsb2Jfc3RvcmUY8ejuRAw&blobName=tigraywb$$11222012075020$$Published$$59063$$P$$631.jpg",
"https://majellaglobal.appspot.com/imageViewer?blobKey=ag9zfm1hamVsbGFnbG9iYWxyEwsSCmJsb2Jfc3RvcmUYkt7_Qww&blobName=tigraywb$$11222012075020$$Published$$59064$$P$$632.jpg",
"https://majellaglobal.appspot.com/imageViewer?blobKey=ag9zfm1hamVsbGFnbG9iYWxyEwsSCmJsb2Jfc3RvcmUYoYncRQw&blobName=tigraywb$$11222012075020$$Published$$59065$$P$$633.jpg",
"https://majellaglobal.appspot.com/imageViewer?blobKey=ag9zfm1hamVsbGFnbG9iYWxyEwsSCmJsb2Jfc3RvcmUYsaygQgw&blobName=tigraywb$$11222012075020$$Published$$59066$$P$$634.jpg",
"https://majellaglobal.appspot.com/imageViewer?blobKey=ag9zfm1hamVsbGFnbG9iYWxyEwsSCmJsb2Jfc3RvcmUYoYe2RAw&blobName=tigraywb$$11222012075020$$Published$$59068$$P$$635.jpg",
"https://majellaglobal.appspot.com/imageViewer?blobKey=ag9zfm1hamVsbGFnbG9iYWxyEwsSCmJsb2Jfc3RvcmUYkd7_Qww&blobName=tigraywb$$11222012075020$$Published$$59069$$P$$636.jpg",
"https://majellaglobal.appspot.com/imageViewer?blobKey=ag9zfm1hamVsbGFnbG9iYWxyEwsSCmJsb2Jfc3RvcmUY4b2SQww&blobName=tigraywb$$11222012075020$$Published$$59070$$P$$637.jpg",
"https://majellaglobal.appspot.com/imageViewer?blobKey=ag9zfm1hamVsbGFnbG9iYWxyEwsSCmJsb2Jfc3RvcmUY0YXhQgw&blobName=tigraywb$$11222012075020$$Published$$59071$$P$$638.jpg",
]

picture_link = open('picture_link.txt', 'w')

counter = 0


log_discareded = open('log_discarded.txt', 'w')
discarded = False
for link in picture_links:
    if link == '':
        continue
    print(f'link: {link}')
    request = requests.get(link, timeout=5)
    if request.status_code == 200:
        counter += 1
        with open(f'pictures/picture{counter}.jpg', 'wb') as picture:
            picture.write(request.content)

        picture_link.write(f'picture{counter}.jpg€€€{link}\n')
        picture_link.flush()

    else:
        print(f'Status: {request.status_code}')
        log_discareded.write(link + '\n')
        log_discareded.flush()
        discarded = True

# if not discarded:
#     break

# time.sleep(2 * 60)


picture_link.close()
log_discareded.close()
