# ================== IMPORTS ==================
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from litellm import completion
import re


# ================== LOAD EMBEDDING MODEL ==================
embedding_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)


# ================== LOAD VECTOR DB ==================
db_path = r"D:\education2\toeho\backend\vectordb\faiss_db_class_11"

vectorstore = FAISS.load_local(
    db_path,
    embedding_model,
    allow_dangerous_deserialization=True
)


# ================== RAG FUNCTION ==================
def _build_messages(query, context):
    return [
        {
            "role": "system",
            "content": (
                "You are a helpful teacher for Class 11 students. "
                "Use simple, clear language and short paragraphs. "
                "Prefer plain text math over LaTeX unless the user explicitly asks for LaTeX. "
                "Keep answers concise and avoid repeating the same conclusion."
            )
        },
        {
            "role": "user",
            "content": f"""
Use ONLY the context below to answer.

Format requirements:
- Keep the response readable and concise.
- Use short bullet points when useful.


Context:
{context}

Question:
{query}
"""
        }
    ]


def _clean_answer(text):
    # Normalize blank lines so output is easier to read in terminal.
    text = text.strip().replace("\r\n", "\n")
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text


def ask_question(query):
    # 🔍 Retrieve relevant chunks
    docs = vectorstore.similarity_search(query, k=4)

    # Combine context
    context = "\n\n".join([doc.page_content for doc in docs])

    # 🤖 Call LLM via LiteLLM
    response = completion(
        model="ollama/qwen2.5:3b",  # change if needed
        messages=_build_messages(query, context),
        api_base="http://localhost:11434",
        temperature=0.1
    )

    return _clean_answer(response["choices"][0]["message"]["content"])


def ask_question_stream(query):
    # 🔍 Retrieve relevant chunks
    docs = vectorstore.similarity_search(query, k=4)

    # Combine context
    context = "\n\n".join([doc.page_content for doc in docs])

    # 🤖 Stream LLM response via LiteLLM
    response_stream = completion(
        model="ollama/qwen2.5:3b",
        messages=_build_messages(query, context),
        api_base="http://localhost:11434",
        temperature=0.1,
        stream=True,
    )

    for chunk in response_stream:
        if not chunk.choices:
            continue
        delta = chunk.choices[0].delta
        if not delta:
            continue
        text = delta.content or ""
        if text:
            yield text


# ================== TEST ==================
STREAM_OUTPUT = True


while True:
    q = input("\nAsk a question (or type 'exit'): ")

    if q.lower() == "exit":
        break

    if STREAM_OUTPUT:
        print("\n📘 Answer:\n", end="")
        for token in ask_question_stream(q):
            print(token, end="", flush=True)
        print()  # newline after stream completes
    else:
        answer = ask_question(q)
        print("\n📘 Answer:\n", answer)