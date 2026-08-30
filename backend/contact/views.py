import os
import resend

from rest_framework import generics
from rest_framework.permissions import AllowAny

from .models import ContactMessage
from .serializers import ContactMessageSerializer


resend.api_key = os.getenv("RESEND_API_KEY")


class ContactMessageCreateView(generics.CreateAPIView):

    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        contact_message = serializer.save()

        resend.Emails.send({
            "from": "AI Fashion Website <onboarding@resend.dev>",
            "to": ["sugunamithra05@gmail.com"],
            "subject": f"New Contact Message from {contact_message.name}",
            "html": f"""
                <h2>New Contact Message</h2>

                <p><strong>Name:</strong> {contact_message.name}</p>

                <p><strong>Email:</strong> {contact_message.email}</p>

                <p><strong>Message:</strong></p>

                <p>{contact_message.message}</p>
            """,
        })