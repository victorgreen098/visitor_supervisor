import os
import os.path
from os import path
from mega import Mega


mega = Mega()
m = mega.login(os.getenv('MEGA_EM'), os.getenv('MEGA_PW'))
for x in range(0,5):
	try:
		file = m.find('db3.sqlite', exclude_deleted=True)
		m.download(file, "/home/vs", "db.sqlite")
		if path.exists('/home/vs/db.sqlite'):
			print("Downloaded database")
			break
	except:
		pass

# for x in range(0,5):
# 	try:
# 		file = m.find('accounts.json', exclude_deleted=True)
# 		m.download(file, "/home/", "accounts.json")
# 		if path.exists('/home/accounts.json'):
# 			print("Downloaded accounts")
# 			break
# 	except:
# 		pass