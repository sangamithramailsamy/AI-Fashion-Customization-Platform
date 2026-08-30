from rest_framework import generics, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from django.conf import settings

from openai import OpenAI

from .serializers import AIDesignSerializer


class AIDesignGenerateView(generics.CreateAPIView):
    serializer_class = AIDesignSerializer
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        prompt = serializer.validated_data["prompt"]
        images = serializer.validated_data.get("images", [])

        try:
            client = OpenAI(api_key=settings.OPENAI_API_KEY)

            if images:
                image_files = []

                for image in images:
                    image_bytes = image.read()

                    image_files.append(
                        (
                            image.name,
                            image_bytes,
                            image.content_type,
                        )
                    )

                result = client.images.edit(
                    model="gpt-image-2",
                    image=image_files,
                    prompt=prompt,
                    size="1024x1024",
                    quality="medium",
                )

            else:
                result = client.images.generate(
                    model="gpt-image-2",
                    prompt=prompt,
                    size="1024x1024",
                    quality="medium",
                )

            image_data = result.data[0].b64_json

            return Response(
                {
                    "prompt": prompt,
                    "image": f"data:image/png;base64,{image_data}",
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            print("AI DESIGN ERROR:", repr(e))

            return Response(
                {
                    "error": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )