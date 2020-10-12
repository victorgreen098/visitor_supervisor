from mega import Mega
import os
import time

while True:
	time.sleep(60*60*2)

	mega = Mega()
	m = mega.login(os.getenv('MEGA_EM'), os.getenv('MEGA_PW'))

	try:
		file = m.find('db1.sqlite')
		m.delete(file[0])
	except:
		pass
	try:
		file = m.find('db2.sqlite')
		m.rename(file, 'db1.sqlite')
	except:
		pass
	try:
		file = m.find('db3.sqlite')
		m.rename(file, 'db2.sqlite')
	except:
		pass

	print('uploading')
	os.environ['PAUSEDB'] = "pause"
	try:
		m.upload("/home/vs/db.sqlite", dest_filename="db3.sqlite")
	except:
		pass
	os.environ['PAUSEDB'] = "0"