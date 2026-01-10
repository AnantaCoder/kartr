"""
Visualization router - Graphs and RAG-based Q&A
"""
import logging
import os
from fastapi import APIRouter, HTTPException, status, Depends
from models.schemas import GraphData, QuestionRequest, QuestionResponse
from utils.dependencies import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Visualization & Q&A"])


def load_creator_sponsor_graph():
    """Load creator-sponsor graph from analysis CSV"""
    try:
        import pandas as pd
        data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
        csv_path = os.path.join(data_dir, 'analysis_results.csv')
        
        if not os.path.exists(csv_path):
            return {"nodes": [], "edges": []}
        
        df = pd.read_csv(csv_path)
        
        nodes = []
        edges = []
        node_ids = set()
        
        for _, row in df.iterrows():
            creator = row.get('Creator Name', 'Unknown')
            sponsor = row.get('Sponsor Name', 'Unknown')
            
            if creator not in node_ids:
                nodes.append({"id": creator, "type": "creator"})
                node_ids.add(creator)
            
            if sponsor != 'No Sponsor' and sponsor not in node_ids:
                nodes.append({"id": sponsor, "type": "sponsor"})
                node_ids.add(sponsor)
            
            if sponsor != 'No Sponsor':
                edges.append({"source": creator, "target": sponsor})
        
        return {"nodes": nodes, "edges": edges}
    except Exception as e:
        logger.error(f"Error loading graph: {e}")
        return {"nodes": [], "edges": [], "error": str(e)}


def load_industry_graph():
    """Load industry relationship graph from analysis CSV"""
    try:
        import pandas as pd
        data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
        csv_path = os.path.join(data_dir, 'analysis_results.csv')
        
        if not os.path.exists(csv_path):
            return {"nodes": [], "edges": []}
        
        df = pd.read_csv(csv_path)
        
        nodes = []
        edges = []
        node_ids = set()
        
        for _, row in df.iterrows():
            creator_industry = row.get('Creator Industry', 'Unknown')
            sponsor_industry = row.get('Sponsor Industry', 'Unknown')
            
            if creator_industry not in node_ids:
                nodes.append({"id": creator_industry, "type": "creator_industry"})
                node_ids.add(creator_industry)
            
            if sponsor_industry != 'N/A' and sponsor_industry not in node_ids:
                nodes.append({"id": sponsor_industry, "type": "sponsor_industry"})
                node_ids.add(sponsor_industry)
            
            if sponsor_industry != 'N/A':
                edges.append({"source": creator_industry, "target": sponsor_industry})
        
        return {"nodes": nodes, "edges": edges}
    except Exception as e:
        logger.error(f"Error loading industry graph: {e}")
        return {"nodes": [], "edges": [], "error": str(e)}


@router.get("/graphs/creator-sponsor")
async def get_creator_sponsor_graph(current_user: dict = Depends(get_current_user)):
    """
    Get creator-sponsor relationship graph data.
    """
    return load_creator_sponsor_graph()


@router.get("/graphs/industry")
async def get_industry_graph(current_user: dict = Depends(get_current_user)):
    """
    Get industry relationship graph data.
    """
    return load_industry_graph()


@router.post("/questions/ask", response_model=QuestionResponse)
async def ask_question(
    request: QuestionRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Answer questions using RAG (Retrieval Augmented Generation).
    """
    try:
        import pandas as pd
        import google.generativeai as genai
        from config import settings
        
        if not settings.GEMINI_API_KEY:
            return QuestionResponse(answer="Gemini API key not configured.")
        
        genai.configure(api_key=settings.GEMINI_API_KEY)
        
        # Load data for context
        data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
        csv_path = os.path.join(data_dir, 'analysis_results.csv')
        
        context = "No data available."
        if os.path.exists(csv_path):
            df = pd.read_csv(csv_path)
            # Filter relevant rows based on question keywords
            keywords = request.question.lower().split()
            mask = df.apply(lambda row: any(kw in str(row).lower() for kw in keywords), axis=1)
            relevant = df[mask].head(10)
            if not relevant.empty:
                context = relevant.to_string(index=False)
        
        # Generate answer
        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = f"""Based on the following data about creators and sponsors:

{context}

Answer this question: {request.question}

Provide a helpful and concise answer based only on the data provided."""
        
        response = model.generate_content(prompt)
        answer = response.text if response.text else "Could not generate an answer."
        
        return QuestionResponse(answer=answer)
        
    except ImportError:
        return QuestionResponse(answer="Google Generative AI module not available.")
    except Exception as e:
        logger.error(f"Question answering error: {e}")
        return QuestionResponse(answer=f"Error processing question: {str(e)}")


@router.post("/questions/ask-graph", response_model=QuestionResponse)
async def ask_graph_question(
    request: QuestionRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Answer questions about graph data.
    """
    return QuestionResponse(
        answer=f"Graph Q&A: You asked about '{request.question}'. This feature is coming soon."
    )


@router.get("/visualization/data")
async def get_visualization_data(current_user: dict = Depends(get_current_user)):
    """
    Get all visualization data for the dashboard.
    """
    try:
        import pandas as pd
        
        data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
        analysis_csv = os.path.join(data_dir, 'analysis_results.csv')
        
        if os.path.exists(analysis_csv):
            df = pd.read_csv(analysis_csv)
            
            # Get summary statistics
            total_analyses = len(df)
            unique_creators = df['Creator Name'].nunique() if 'Creator Name' in df.columns else 0
            unique_sponsors = df['Sponsor Name'].nunique() if 'Sponsor Name' in df.columns else 0
            
            return {
                "total_analyses": total_analyses,
                "unique_creators": unique_creators,
                "unique_sponsors": unique_sponsors,
                "recent_analyses": df.tail(10).to_dict('records')
            }
        
        return {
            "total_analyses": 0,
            "unique_creators": 0,
            "unique_sponsors": 0,
            "recent_analyses": []
        }
        
    except Exception as e:
        logger.error(f"Error getting visualization data: {e}")
        return {"error": str(e)}
