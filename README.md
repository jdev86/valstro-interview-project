# Real-time Chat Project

## Solution Overview

User has the ability to open multiple tabs or windows and send or receive unique messages

Messages are made unique by session id and "login" timestamp.  Timestamp is retrieved using RXjs and formatted using built-in Date function.

Messages are color coded by userid, marked with a date timestamp, and include the unique username of the sender

Messages and user information persist after reload

There is also a button titled 'Clean Slate' that will reset the form and localstorage.  This works across windows/tabs and it makes testing a bit easier.

I added a basic theme using a custom hook.  It persists across windows/tabs.  To try it use the light and dark buttons in the top right to toggle.
## Technical Bits

There is a reducer that handles setting the user profile, messages, and maintains the message entered.  This reducer also provides all data to view.

I am using broadcast channel api to communicate between windows and tabs.

As a styling bonus there is a hook that handles toggling from light to dark mode.

## Setup

- Clone the repo & cd into it.
- Run `yarn install`
- Followed by `yarn dev` to start the development server
