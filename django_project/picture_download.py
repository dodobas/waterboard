import requests
import time

file_pictures = open('/home/frane/Desktop/pictures/links.txt', 'r')
picture_links = file_pictures.read().split('\n')

picture_link = open('/home/frane/Desktop/pictures/picture_link.txt','a')
picture_name = open('/home/frane/Desktop/pictures/picture_name.txt','a')
counter = 0

while True:
    log_discareded = open('/home/frane/Desktop/pictures/log_discarded.txt','w')
    discarded = False
    for link in picture_links:
        if link == '':
            continue
        r = requests.get(link)
        if r.status_code == 200:
            counter += 1
            if counter == 20:
                a = 3
            elif counter == 40:
                a=3
            with open(f'/home/frane/Desktop/pictures/picture{counter}.jpg', 'wb') as picture:
                picture.write(r.content)
            # del(picture_links[picture_links.index(link)])
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
    time.sleep(2*60)


picture_link.close()
picture_name.close()
log_discareded.close()
