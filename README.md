# SmsHospitalSurveyChatbot
This app has been designed to take health survey from user by asking the user a series of questions and storing user responses in the database.
The app communicates with the user via  SMS to send and receive messages from the server.
The sms from the user is first sent to twili API which then redirects to a nodejs server and the server stores the data in the cloud mongodb database.
Similarly, as per users response the server sends appropriate questions to user until survey gets completed.
The API itself has been deployed on ngrok website which converts a local url to a remote one hosted on internet connection.

