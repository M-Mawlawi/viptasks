from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import authentication_classes, api_view,permission_classes
from rest_framework.permissions import IsAuthenticated


from django.http import JsonResponse,HttpResponse

from django.core.paginator import Paginator, PageNotAnInteger, EmptyPage
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from .models import Message,Thread
from .serializers import MessageSerializer

from users.models import CustomUser,ProfilePhoto


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_username(request):
    return Response({'username': request.user.username})

def index(request):
    users = CustomUser.objects.all()
    print(users[0].email)
    return HttpResponse(users)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_chat_messages(request, username):
    page_number = request.GET.get('page', 1)
    page_size = 10  # Number of messages per page

    other_user = get_object_or_404(CustomUser, username=username)
    if request.user != other_user:
        thread = Thread.objects.filter(users=request.user).filter(users=other_user)
        if not thread.exists():
            return JsonResponse({'error': 'Thread does not exist'}, status=404)

        thread = thread[0]
        messages = Message.objects.filter(thread=thread).order_by('-created_at')  # Keep the original order

        paginator = Paginator(messages, page_size)

        try:
            page = paginator.page(page_number)
        except PageNotAnInteger:
            page = paginator.page(1)
        except EmptyPage:
            return JsonResponse({'error': 'Page not found'}, status=404)

        # Reverse the messages within the page
        page_messages = list(page)
        page_messages.reverse()

        serialized_messages = MessageSerializer(page_messages, many=True)
        messages = serialized_messages.data
        next_page = page.has_next()

        response_data = {
            'messages': messages,
            'next_page': next_page,
        }
    else:
        response_data = {
            'error': 'You can\'t chat with yourself'
        }
    return Response(response_data)



@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_chats(request):
    chats = Thread.objects.filter(users__in=[request.user])

    response_data = []
    
    def get_content_type(obj):
        if obj.content_type.model == 'textmessage':
            return obj.content_object.text
        elif obj.content_type.model == 'image':
            return obj.content_object.image.url
        return None

    for chat in chats:
        thread_id = chat.id
        other_user = chat.users.exclude(pk=request.user.pk).first()
        last_message = Message.objects.filter(thread_id=thread_id).order_by('-created_at').first()
        photo = str(ProfilePhoto.objects.filter(user=other_user).latest('id').profile_photo.url)[1:]
        if last_message:
            showup_message = get_content_type(last_message)

            chat_data = {
                'user': other_user.username,
                'showup_message': showup_message if last_message else None,
                'showup_message_time': last_message.created_at if last_message else None,
                'photo':photo,
            }
            
            response_data.append(chat_data)
    
    sorted_response_data = sorted(response_data, key=lambda x: x['showup_message_time'], reverse=True)
    
    return Response(sorted_response_data)



@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def set_readed(request):
    # Assuming you receive the sender's username in the request data
    sender_username = request.data.get("activeChat")
    
    # Get the sender user object
    sender = get_object_or_404(get_user_model(), username=sender_username)
    
    # Find the thread that includes the sender and the current user
    thread = Thread.objects.filter(users__in=[request.user, sender]).distinct()
    
    if thread.exists():
        thread = thread.first()
        
        # Update messages from the sender in the thread to be marked as read
        Message.objects.filter(thread=thread, sender=sender, readed=False).update(readed=True)
        
        return Response({'message': 'Messages updated successfully'})
    else:
        return Response({'message': 'Thread not found'}, status=404)
