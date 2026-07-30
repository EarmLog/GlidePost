import requests

def send_facebook(page_id, access_token, message):
    url = f"https://graph.facebook.com/{page_id}/feed"
    payload = {"message": message, "access_token": access_token}
    return requests.post(url, data=payload).json()