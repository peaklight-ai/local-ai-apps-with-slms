# Functional Specification Document

# App Description 

Private document summarizer. App works on local, ensuring Privacy, low latency, and access with no internet.

# User personas and Outcome for user

- Lawyer in need of private doc summarization (desktop/mobile  
- Doctor on desk (Desktop)  
- Any professional dealing with private data (desktop/mobile  
- Bloopjmberg employee wanting to look better than a JPM one

- People on a plane (desktop or mobile)

# App flow and pages

**IMPORTANT:** dooc summariser \> Chatboto

User imports document from local disk, application automatically summarizes the content, chatbot to chat with the doc data, ability to export.

Import button (summarize) \-\> see summary, chatbox (RAG) for chat, export button for PDF

We need: local LLM (phi-4), RAG database setup, chatbot setup, export to PDF.  
Tech stack: phi4, FAISS, \[research chatbot and export\]  
LLMs: if smartphone phi4,3.2B; if desktop, Qwen3-8B

Make models interchangeable. and this app should be something that does something with sensitive customer data. and we would license the software in the future