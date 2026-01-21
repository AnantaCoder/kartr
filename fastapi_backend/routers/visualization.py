"""
Visualization Router - Graphs and RAG-based Q&A

This module provides endpoints for:
- Creator-sponsor relationship graphs
- Industry relationship graphs
- RAG-based question answering using Gemini AI
- Dashboard visualization data
"""
import logging
import os
from typing import Dict, Any, List

# Third-party imports
import pandas as pd
import google.generativeai as genai
from fastapi import APIRouter, Depends

# Local imports
from config import settings
from database import is_firebase_configured
from firebase_config import FirestoreRepository
from models.schemas import GraphData, QuestionRequest, QuestionResponse
from utils.dependencies import get_current_user


# =============================================================================
# Configuration
# =============================================================================

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["Visualization & Q&A"])

# Constants
MAX_GRAPH_RECORDS = 500
MAX_RAG_RECORDS = 100
MAX_RAG_RESULTS = 10
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
CSV_PATH = os.path.join(DATA_DIR, 'analysis_results.csv')


# =============================================================================
# Helper Functions - Graph Data Loading
# =============================================================================

def _build_graph_from_firebase(field_creator: str, field_sponsor: str, 
                                type_creator: str, type_sponsor: str,
                                skip_value: str = 'No Sponsor') -> Dict[str, Any]:
    """
    Build graph data from Firebase video_analyses collection.
    
    Args:
        field_creator: Field name for creator data
        field_sponsor: Field name for sponsor data
        type_creator: Node type for creators
        type_sponsor: Node type for sponsors
        skip_value: Value to skip for sponsor (e.g., 'No Sponsor', 'N/A')
    
    Returns:
        Dict with nodes and edges, or empty if no data
    """
    nodes = []
    edges = []
    node_ids = set()
    
    analyses_repo = FirestoreRepository('video_analyses')
    analyses = analyses_repo.find_all(limit=MAX_GRAPH_RECORDS)
    
    for row in analyses:
        creator = row.get(field_creator, 'Unknown')
        sponsor = row.get(field_sponsor, 'Unknown')
        
        # Add creator node
        if creator and creator not in node_ids:
            nodes.append({"id": creator, "type": type_creator})
            node_ids.add(creator)
        
        # Add sponsor node (skip placeholder values)
        if sponsor and sponsor != skip_value and sponsor not in node_ids:
            nodes.append({"id": sponsor, "type": type_sponsor})
            node_ids.add(sponsor)
        
        # Add edge
        if sponsor and sponsor != skip_value:
            edges.append({"source": creator, "target": sponsor})
    
    return {"nodes": nodes, "edges": edges} if (nodes or edges) else None


def _build_graph_from_csv(col_creator: str, col_sponsor: str,
                          type_creator: str, type_sponsor: str,
                          skip_value: str = 'No Sponsor') -> Dict[str, Any]:
    """
    Build graph data from CSV file (fallback).
    
    Args:
        col_creator: Column name for creator data
        col_sponsor: Column name for sponsor data
        type_creator: Node type for creators
        type_sponsor: Node type for sponsors
        skip_value: Value to skip for sponsor
    
    Returns:
        Dict with nodes and edges
    """
    nodes = []
    edges = []
    node_ids = set()
    
    if not os.path.exists(CSV_PATH):
        return {"nodes": [], "edges": []}
    
    df = pd.read_csv(CSV_PATH)
    
    for _, row in df.iterrows():
        creator = row.get(col_creator, 'Unknown')
        sponsor = row.get(col_sponsor, 'Unknown')
        
        if creator not in node_ids:
            nodes.append({"id": creator, "type": type_creator})
            node_ids.add(creator)
        
        if sponsor != skip_value and sponsor not in node_ids:
            nodes.append({"id": sponsor, "type": type_sponsor})
            node_ids.add(sponsor)
        
        if sponsor != skip_value:
            edges.append({"source": creator, "target": sponsor})
    
    return {"nodes": nodes, "edges": edges}


def load_creator_sponsor_graph() -> Dict[str, Any]:
    """Load creator-sponsor relationship graph from Firebase or CSV fallback."""
    try:
        # Try Firebase first
        if is_firebase_configured():
            result = _build_graph_from_firebase(
                field_creator='creator_name',
                field_sponsor='sponsor_name',
                type_creator='creator',
                type_sponsor='sponsor',
                skip_value='No Sponsor'
            )
            if result:
                return result
        
        # Fallback to CSV
        return _build_graph_from_csv(
            col_creator='Creator Name',
            col_sponsor='Sponsor Name',
            type_creator='creator',
            type_sponsor='sponsor',
            skip_value='No Sponsor'
        )
        
    except Exception as e:
        logger.error(f"Error loading creator-sponsor graph: {e}")
        return {"nodes": [], "edges": [], "error": str(e)}


def load_industry_graph() -> Dict[str, Any]:
    """Load industry relationship graph from Firebase or CSV fallback."""
    try:
        # Try Firebase first
        if is_firebase_configured():
            result = _build_graph_from_firebase(
                field_creator='creator_industry',
                field_sponsor='sponsor_industry',
                type_creator='creator_industry',
                type_sponsor='sponsor_industry',
                skip_value='N/A'
            )
            if result:
                return result
        
        # Fallback to CSV
        return _build_graph_from_csv(
            col_creator='Creator Industry',
            col_sponsor='Sponsor Industry',
            type_creator='creator_industry',
            type_sponsor='sponsor_industry',
            skip_value='N/A'
        )
        
    except Exception as e:
        logger.error(f"Error loading industry graph: {e}")
        return {"nodes": [], "edges": [], "error": str(e)}


# =============================================================================
# Helper Functions - RAG Context Building
# =============================================================================

def _get_rag_context_from_firebase(keywords: List[str]) -> str:
    """
    Retrieve relevant context from Firebase for RAG.
    
    Args:
        keywords: List of keywords to filter by
        
    Returns:
        Formatted context string
    """
    analyses_repo = FirestoreRepository('video_analyses')
    analyses = analyses_repo.find_all(limit=MAX_RAG_RECORDS)
    
    relevant = []
    for row in analyses:
        row_str = str(row).lower()
        if any(kw in row_str for kw in keywords):
            relevant.append(row)
            if len(relevant) >= MAX_RAG_RESULTS:
                break
    
    if not relevant:
        return "No data available."
    
    return "\n".join([
        f"Creator: {r.get('creator_name')}, Industry: {r.get('creator_industry')}, "
        f"Sponsor: {r.get('sponsor_name')}, Sponsor Industry: {r.get('sponsor_industry')}, "
        f"Video: {r.get('video_title')}"
        for r in relevant
    ])


def _get_rag_context_from_csv(keywords: List[str]) -> str:
    """
    Retrieve relevant context from CSV for RAG (fallback).
    
    Args:
        keywords: List of keywords to filter by
        
    Returns:
        Formatted context string
    """
    if not os.path.exists(CSV_PATH):
        return "No data available."
    
    df = pd.read_csv(CSV_PATH)
    mask = df.apply(lambda row: any(kw in str(row).lower() for kw in keywords), axis=1)
    relevant_df = df[mask].head(MAX_RAG_RESULTS)
    
    if relevant_df.empty:
        return "No data available."
    
    return relevant_df.to_string(index=False)


# =============================================================================
# API Endpoints - Graphs
# =============================================================================

@router.get("/graphs/creator-sponsor")
async def get_creator_sponsor_graph(current_user: dict = Depends(get_current_user)):
    """
    Get creator-sponsor relationship graph data.
    
    Returns nodes (creators, sponsors) and edges (partnerships) for visualization.
    """
    return load_creator_sponsor_graph()


@router.get("/graphs/industry")
async def get_industry_graph(current_user: dict = Depends(get_current_user)):
    """
    Get industry relationship graph data.
    
    Returns nodes (industries) and edges (cross-industry partnerships) for visualization.
    """
    return load_industry_graph()


# =============================================================================
# API Endpoints - RAG Q&A
# =============================================================================

@router.post("/questions/ask", response_model=QuestionResponse)
async def ask_question(
    request: QuestionRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Answer questions using RAG (Retrieval Augmented Generation).
    
    Searches analysis data for relevant context and uses Gemini AI
    to generate an answer based on the retrieved data.
    """
    try:
        if not settings.GEMINI_API_KEY:
            return QuestionResponse(answer="Gemini API key not configured.")
        
        genai.configure(api_key=settings.GEMINI_API_KEY)
        keywords = request.question.lower().split()
        
        # Get context from Firebase or CSV
        if is_firebase_configured():
            context = _get_rag_context_from_firebase(keywords)
        else:
            context = _get_rag_context_from_csv(keywords)
        
        # Generate answer using Gemini
        model = genai.GenerativeModel(settings.GEMINI_TEXT_MODEL)
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
    
    (Coming soon - will analyze graph structure to answer questions)
    """
    return QuestionResponse(
        answer=f"Graph Q&A: You asked about '{request.question}'. This feature is coming soon."
    )


# =============================================================================
# API Endpoints - Dashboard Data
# =============================================================================

@router.get("/visualization/data")
async def get_visualization_data(current_user: dict = Depends(get_current_user)):
    """
    Get all visualization data for the dashboard.
    
    Returns summary statistics and recent analyses.
    """
    try:
        # Try Firebase first
        if is_firebase_configured():
            analyses_repo = FirestoreRepository('video_analyses')
            analyses = analyses_repo.find_all(limit=100)
            
            creators = set(a.get('creator_name') for a in analyses if a.get('creator_name'))
            sponsors = set(a.get('sponsor_name') for a in analyses 
                          if a.get('sponsor_name') and a.get('sponsor_name') != 'No Sponsor')
            
            return {
                "total_analyses": len(analyses),
                "unique_creators": len(creators),
                "unique_sponsors": len(sponsors),
                "recent_analyses": analyses[-10:] if analyses else []
            }
        
        # Fallback to CSV
        if os.path.exists(CSV_PATH):
            df = pd.read_csv(CSV_PATH)
            
            return {
                "total_analyses": len(df),
                "unique_creators": df['Creator Name'].nunique() if 'Creator Name' in df.columns else 0,
                "unique_sponsors": df['Sponsor Name'].nunique() if 'Sponsor Name' in df.columns else 0,
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
