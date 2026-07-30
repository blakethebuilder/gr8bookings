import urllib.request, json

tok = json.loads(urllib.request.urlopen(urllib.request.Request(
    'https://gr8bookings.smartintegrate.co.za/api/collections/_superusers/auth-with-password',
    data=json.dumps({"identity":"grandmaster@gr8escape.co.za","password":"gr8@2026!"}).encode(),
    headers={"Content-Type":"application/json"}
)).read())["token"]
hdr = {"Authorization":"Bearer "+tok,"Content-Type":"application/json"}

gms = [
    {"name":"Thabo","email":"thabo@gr8escape.co.za","role":"gamemaster","is_active":True,"password":"gr8@2026","passwordConfirm":"gr8@2026","pin_code":"5678","phone":"","avatar_color":"#4CAF50","is_working":False},
    {"name":"Zanele","email":"zanele@gr8escape.co.za","role":"gamemaster","is_active":True,"password":"gr8@2026","passwordConfirm":"gr8@2026","pin_code":"9012","phone":"","avatar_color":"#9C27B0","is_working":False},
    {"name":"Ryan","email":"ryan@gr8escape.co.za","role":"gamemaster","is_active":True,"password":"gr8@2026","passwordConfirm":"gr8@2026","pin_code":"3456","phone":"","avatar_color":"#FF9800","is_working":False},
]

for gm in gms:
    try:
        r = urllib.request.urlopen(urllib.request.Request(
            'https://gr8bookings.smartintegrate.co.za/api/collections/staff/records',
            data=json.dumps(gm).encode(), headers=hdr
        ))
        body = json.loads(r.read())
        print(f"✓ {gm['name']} created (id={body['id']})")
    except urllib.error.HTTPError as e:
        err = json.loads(e.read())
        print(f"✗ {gm['name']}: {err.get('message','?')}")
