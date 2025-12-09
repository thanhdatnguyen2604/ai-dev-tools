import json
import uuid
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

# In-memory storage for sessions
sessions_storage = {}

class SessionConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.session_id = self.scope['url_route']['kwargs']['session_id']
        self.session_group_name = f'session_{self.session_id}'

        # Initialize session if it doesn't exist
        if self.session_id not in sessions_storage:
            sessions_storage[self.session_id] = {
                'code': '// Welcome to the coding interview!\n// Start coding here...\n',
                'language': 'javascript',
                'connected_users': []
            }

        # Add user to connected users
        sessions_storage[self.session_id]['connected_users'].append(self.channel_name)

        # Join session group
        await self.channel_layer.group_add(
            self.session_group_name,
            self.channel_name
        )

        # Accept connection
        await self.accept()

        # Send current session state to the newly connected user
        await self.send(text_data=json.dumps({
            'type': 'init',
            'code': sessions_storage[self.session_id]['code'],
            'language': sessions_storage[self.session_id]['language'],
            'connected_users': len(sessions_storage[self.session_id]['connected_users'])
        }))

        # Notify other users about the new connection
        await self.channel_layer.group_send(
            self.session_group_name,
            {
                'type': 'user_count_update',
                'connected_users': len(sessions_storage[self.session_id]['connected_users'])
            }
        )

    async def disconnect(self, close_code):
        # Remove user from connected users
        if self.session_id in sessions_storage:
            sessions_storage[self.session_id]['connected_users'].remove(self.channel_name)

            # Notify other users about the disconnection
            await self.channel_layer.group_send(
                self.session_group_name,
                {
                    'type': 'user_count_update',
                    'connected_users': len(sessions_storage[self.session_id]['connected_users'])
                }
            )

        # Leave session group
        await self.channel_layer.group_discard(
            self.session_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get('type')

        if message_type == 'update':
            # Update session state
            sessions_storage[self.session_id]['code'] = text_data_json.get('code', '')
            sessions_storage[self.session_id]['language'] = text_data_json.get('language', 'javascript')

            # Broadcast update to all users in the session
            await self.channel_layer.group_send(
                self.session_group_name,
                {
                    'type': 'code_update',
                    'code': sessions_storage[self.session_id]['code'],
                    'language': sessions_storage[self.session_id]['language']
                }
            )

    async def code_update(self, event):
        # Send code update to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'update',
            'code': event['code'],
            'language': event['language']
        }))

    async def user_count_update(self, event):
        # Send user count update to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'user_count',
            'connected_users': event['connected_users']
        }))