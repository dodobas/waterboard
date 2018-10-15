# -*- coding: utf-8 -*-
import time

import requests

picture_links = open('/home/frane/Desktop/pictures/links.txt', 'r')
picture_links = picture_links.read().split('\n')

picture_link = open('/home/frane/Desktop/pictures/picture_link.txt', 'a')
picture_name = open('/home/frane/Desktop/pictures/picture_name.txt', 'a')

counter = 0

while True:
    log_discareded = open('/home/frane/Desktop/pictures/log_discarded.txt', 'w')
    discarded = False
    for link in picture_links:
        if link == '':
            continue
        request = requests.get(link)
        if request.status_code == 200:
            counter += 1
            with open(f'/home/frane/Desktop/pictures/picture{counter}.jpg', 'wb') as picture:
                picture.write(request.content)

            picture_link.write(link + '\n')
            picture_link.flush()

            picture_name.write(f'picture{counter}.jpg' + '\n')
            picture_name.flush()

        else:
            log_discareded.write(link + '\n')
            log_discareded.flush()
            discarded = True

    if not discarded:
        break

    time.sleep(2 * 60)


picture_link.close()
picture_name.close()
log_discareded.close()
