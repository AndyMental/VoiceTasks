# Gpt-5.0

\# pip install azure-ai-inference  
import os  
from azure.ai.inference import ChatCompletionsClient  
from azure.core.credentials import AzureKeyCredential

api\_key \= os.getenv("AZURE\_INFERENCE\_CREDENTIAL", '')  
if not api\_key:  
  raise Exception("A key should be provided to invoke the endpoint")

client \= ChatCompletionsClient(  
    endpoint='https://anand-m9ky8ewh-eastus2.openai.azure.com/openai/deployments/gpt-5',  
    credential=AzureKeyCredential(api\_key),  
      
)

payload \= {  
  "messages": \[  
    {  
      "role": "user",  
      "content": "I am going to Paris, what should I see?"  
    },  
    {  
      "role": "assistant",  
      "content": "Paris, the capital of France, is known for its stunning architecture, art museums, historical landmarks, and romantic atmosphere. Here are some of the top attractions to see in Paris:\\n\\n1. The Eiffel Tower: The iconic Eiffel Tower is one of the most recognizable landmarks in the world and offers breathtaking views of the city.\\n2. The Louvre Museum: The Louvre is one of the world's largest and most famous museums, housing an impressive collection of art and artifacts, including the Mona Lisa.\\n3. Notre-Dame Cathedral: This beautiful cathedral is one of the most famous landmarks in Paris and is known for its Gothic architecture and stunning stained glass windows.\\n\\nThese are just a few of the many attractions that Paris has to offer. With so much to see and do, it's no wonder that Paris is one of the most popular tourist destinations in the world."  
    },  
    {  
      "role": "user",  
      "content": "What is so great about \#1?"  
    }  
  \]  
}  
response \= client.complete(payload)

print("Response:", response.choices\[0\].message.content)  
print("Model:", response.model)  
print("Usage:")  
print("	Prompt tokens:", response.usage.prompt\_tokens)  
print("	Total tokens:", response.usage.total\_tokens)  
print("	Completion tokens:", response.usage.completion\_tokens)

# Gpt-4.1

https://anand-m9ky8ewh-eastus2.openai.azure.com/openai/deployments/gpt-4.1/v1/chat/completions

\# pip install azure-ai-inference  
import os  
from azure.ai.inference import ChatCompletionsClient  
from azure.core.credentials import AzureKeyCredential

api\_key \= os.getenv("AZURE\_INFERENCE\_CREDENTIAL", '')  
if not api\_key:  
  raise Exception("A key should be provided to invoke the endpoint")

client \= ChatCompletionsClient(  
    endpoint='https://anand-m9ky8ewh-eastus2.openai.azure.com/openai/deployments/gpt-4.1',  
    credential=AzureKeyCredential(api\_key),  
      
)

payload \= {  
  "messages": 10,  
  "temperature": 1,  
  "top\_p": 1,  
  "stop": \[\],  
  "frequency\_penalty": 0,  
  "presence\_penalty": 0  
}  
response \= client.complete(payload)

print("Response:", response.choices\[0\].message.content)  
print("Model:", response.model)  
print("Usage:")  
print("	Prompt tokens:", response.usage.prompt\_tokens)  
print("	Total tokens:", response.usage.total\_tokens)  
print("	Completion tokens:", response.usage.completion\_tokens)

# Gpt-4.1-mini

[https://anand-m9ky8ewh-eastus2.openai.azure.com/openai/deployments/gpt-4.1-mini/v1/chat/completions](https://anand-m9ky8ewh-eastus2.openai.azure.com/openai/deployments/gpt-4.1-mini/v1/chat/completions)

\# pip install azure-ai-inference  
import os  
from azure.ai.inference import ChatCompletionsClient  
from azure.core.credentials import AzureKeyCredential

api\_key \= os.getenv("AZURE\_INFERENCE\_CREDENTIAL", '')  
if not api\_key:  
  raise Exception("A key should be provided to invoke the endpoint")

client \= ChatCompletionsClient(  
    endpoint='https://anand-m9ky8ewh-eastus2.openai.azure.com/openai/deployments/gpt-4.1-mini',  
    credential=AzureKeyCredential(api\_key),  
      
)

payload \= {  
  "messages": 10,  
  "temperature": 1,  
  "top\_p": 1,  
  "stop": \[\],  
  "frequency\_penalty": 0,  
  "presence\_penalty": 0  
}  
response \= client.complete(payload)

print("Response:", response.choices\[0\].message.content)  
print("Model:", response.model)  
print("Usage:")  
print("	Prompt tokens:", response.usage.prompt\_tokens)  
print("	Total tokens:", response.usage.total\_tokens)  
print("	Completion tokens:", response.usage.completion\_tokens)

# Gpt-4.1-nano

[https://genai-trigent-openai.openai.azure.com/openai/deployments/gpt-4.1-nano/v1/chat/completions](https://genai-trigent-openai.openai.azure.com/openai/deployments/gpt-4.1-nano/v1/chat/completions)

\# pip install azure-ai-inference  
import os  
from azure.ai.inference import ChatCompletionsClient  
from azure.core.credentials import AzureKeyCredential

api\_key \= os.getenv("AZURE\_INFERENCE\_CREDENTIAL", '')  
if not api\_key:  
  raise Exception("A key should be provided to invoke the endpoint")

client \= ChatCompletionsClient(  
    endpoint='https://genai-trigent-openai.openai.azure.com/openai/deployments/gpt-4.1-nano',  
    credential=AzureKeyCredential(api\_key),  
      
)

payload \= {  
  "messages": 10,  
  "temperature": 1,  
  "top\_p": 1,  
  "stop": \[\],  
  "frequency\_penalty": 0,  
  "presence\_penalty": 0  
}  
response \= client.complete(payload)

print("Response:", response.choices\[0\].message.content)  
print("Model:", response.model)  
print("Usage:")  
print("	Prompt tokens:", response.usage.prompt\_tokens)  
print("	Total tokens:", response.usage.total\_tokens)  
print("	Completion tokens:", response.usage.completion\_tokens)

# Gpt-4o-transcribe-diarize

1\. Authentication using API Key  
For Serverless API Endpoints, deploy the Model to generate the endpoint URL and an API key to authenticate against the service. In this sample endpoint and key are strings holding the endpoint URL and the API Key. The API endpoint URL and API key can be found on the Deployments \+ Endpoint page once the model is deployed.

If you're using bash:

export AZURE\_API\_KEY="\<your-api-key\>"

If you're in powershell:

$Env:AZURE\_API\_KEY \= "\<your-api-key\>"

If you're using Windows command prompt:

set AZURE\_API\_KEY \= \<your-api-key\>

2\. Run a basic code sample  
Paste the following into a shell

curl \-X POST "https://anand-m9ky8ewh-eastus2.openai.azure.com/openai/deployments/gpt-4o-transcribe-diarize/audio/transcriptions?api-version=2025-03-01-preview" \\  
  \-H "Content-Type: multipart/form-data" \\  
  \-H "Authorization: Bearer $AZURE\_API\_KEY" \\  
  \-d '{  
     "model": "gpt-4o-transcribe-diarize",  
     "file": "@path/to/file/audio.mp3"  
    }'

# Gpt-5.1

[https://anand-m9ky8ewh-eastus2.openai.azure.com/openai/v1/chat/completions](https://anand-m9ky8ewh-eastus2.openai.azure.com/openai/v1/chat/completions)

\# pip install azure-ai-inference  
import os  
from azure.ai.inference import ChatCompletionsClient  
from azure.core.credentials import AzureKeyCredential

api\_key \= os.getenv("AZURE\_INFERENCE\_CREDENTIAL", '')  
if not api\_key:  
  raise Exception("A key should be provided to invoke the endpoint")

client \= ChatCompletionsClient(  
    endpoint='https://anand-m9ky8ewh-eastus2.openai.azure.com/openai/v1/chat',  
    credential=AzureKeyCredential(api\_key),  
      
)

payload \= {  
  "messages": \[  
    {  
      "role": "user",  
      "content": "I am going to Paris, what should I see?"  
    },  
    {  
      "role": "assistant",  
      "content": "Paris, the capital of France, is known for its stunning architecture, art museums, historical landmarks, and romantic atmosphere. Here are some of the top attractions to see in Paris:\\n\\n1. The Eiffel Tower: The iconic Eiffel Tower is one of the most recognizable landmarks in the world and offers breathtaking views of the city.\\n2. The Louvre Museum: The Louvre is one of the world's largest and most famous museums, housing an impressive collection of art and artifacts, including the Mona Lisa.\\n3. Notre-Dame Cathedral: This beautiful cathedral is one of the most famous landmarks in Paris and is known for its Gothic architecture and stunning stained glass windows.\\n\\nThese are just a few of the many attractions that Paris has to offer. With so much to see and do, it's no wonder that Paris is one of the most popular tourist destinations in the world."  
    },  
    {  
      "role": "user",  
      "content": "What is so great about \#1?"  
    }  
  \]  
}  
response \= client.complete(payload)

print("Response:", response.choices\[0\].message.content)  
print("Model:", response.model)  
print("Usage:")  
print("	Prompt tokens:", response.usage.prompt\_tokens)  
print("	Total tokens:", response.usage.total\_tokens)  
print("	Completion tokens:", response.usage.completion\_tokens)

# 

# Gpt-realtime-mini

Endpoint  
Target URI  
https://anand-m9ky8ewh-eastus2.openai.azure.com/openai/realtime?api-version=2024-10-01-preview\&deployment=gpt-realtime-mini

Authentication type  
Key  
<your-api-key>

# Sora

Get Started  
1\. Authentication using API Key  
For Serverless API Endpoints, deploy the Model to generate the endpoint URL and an API key to authenticate against the service. In this sample endpoint and key are strings holding the endpoint URL and the API Key. The API endpoint URL and API key can be found on the Deployments \+ Endpoint page once the model is deployed.

If you're using bash:

export AZURE\_API\_KEY="\<your-api-key\>"

If you're in powershell:

$Env:AZURE\_API\_KEY \= "\<your-api-key\>"

If you're using Windows command prompt:

set AZURE\_API\_KEY \= \<your-api-key\>

2\. Run a basic code sample  
To generate a video, paste the following into a shell

curl \-X POST "https://anand-m9ky8ewh-eastus2.openai.azure.com/openai/v1/video/generations/jobs?api-version=preview" \\  
  \-H "Content-Type: application/json" \\  
  \-H "Api-key: $AZURE\_API\_KEY" \\  
  \-d '{  
     "model": "sora",  
     "prompt" : "A video of a cat",  
     "height" : "1080",  
     "width" : "1080",  
     "n\_seconds" : "5",  
     "n\_variants" : "1"  
    }'

# Whisper

Endpoint  
Target URI  
https://anand-m9ky8ewh-eastus2.openai.azure.com/openai/deployments/whisper/audio/translations?api-version=2024-06-01

Authentication type  
Key  
<your-api-key>

# gpt-4o-mini

import os  
from openai import AzureOpenAI

endpoint \= "https://genai-trigent-openai.openai.azure.com/"  
model\_name \= "gpt-4o-mini"  
deployment \= "gpt-4o-mini"

subscription\_key \= "\<your-api-key\>"  
api\_version \= "2024-12-01-preview"

client \= AzureOpenAI(  
    api\_version=api\_version,  
    azure\_endpoint=endpoint,  
    api\_key=subscription\_key,  
)

response \= client.chat.completions.create(  
    stream=True,  
    messages=\[  
        {  
            "role": "system",  
            "content": "You are a helpful assistant.",  
        },  
        {  
            "role": "user",  
            "content": "I am going to Paris, what should I see?",  
        }  
    \],  
    max\_tokens=4096,  
    temperature=1.0,  
    top\_p=1.0,  
    model=deployment,  
)

for update in response:  
    if update.choices:  
        print(update.choices\[0\].delta.content or "", end="")

client.close()

# Meta-Llama-3-1-405B-Instruct

import os  
from azure.ai.inference import ChatCompletionsClient  
from azure.ai.inference.models import SystemMessage, UserMessage  
from azure.core.credentials import AzureKeyCredential

endpoint \= "https://Meta-Llama-3-1-405B-Instruct-uyo.eastus.models.ai.azure.com"  
model\_name \= "Meta-Llama-3.1-405B-Instruct"

client \= ChatCompletionsClient(  
    endpoint=endpoint,  
    credential=AzureKeyCredential("\<API\_KEY\>"),  
)

response \= client.complete(  
    stream=True,  
    messages=\[  
        SystemMessage(content="You are a helpful assistant."),  
        UserMessage(content="I am going to Paris, what should I see?")  
    \],  
    max\_tokens=2048,  
    temperature=0.8,  
    top\_p=0.1,  
    presence\_penalty=0.0,  
    frequency\_penalty=0.0,  
    model=model\_name  
)

for update in response:  
    if update.choices:  
        print(update.choices\[0\].delta.content or "", end="")

client.close()