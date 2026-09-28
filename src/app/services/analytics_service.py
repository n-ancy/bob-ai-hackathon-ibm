import networkx as nx
import logging
from typing import Dict, Any, List
from app.models.schemas import NetworkAnalytics, EntityCentrality, CommunityCluster
from app.db.graph_db import db

logger = logging.getLogger("CFNA.Analytics")

class NetworkAnalyticsEngine:
    """Module 8: Graph Analytics & Community Detection using NetworkX."""

    @classmethod
    def calculate_analytics(cls, case_id: str) -> NetworkAnalytics:
        graph = db.graph

        # Subgraph for specific case
        case_nodes = [n for n, d in graph.nodes(data=True) if d.get("case_id") == case_id or not case_id]
        if not case_nodes:
            return NetworkAnalytics(
                total_nodes=0,
                total_edges=0,
                density=0.0,
                communities_count=0,
                top_centrality_entities=[],
                communities=[]
            )

        subgraph = graph.subgraph(case_nodes).copy()
        undirected_subgraph = subgraph.to_undirected()

        # Centralities
        try:
            deg_centrality = nx.degree_centrality(undirected_subgraph)
            bet_centrality = nx.betweenness_centrality(undirected_subgraph)
            close_centrality = nx.closeness_centrality(undirected_subgraph)
            pr_centrality = nx.pagerank(undirected_subgraph) if len(undirected_subgraph) > 0 else {}
        except Exception as e:
            logger.warning(f"Error computing centralities: {e}")
            deg_centrality, bet_centrality, close_centrality, pr_centrality = {}, {}, {}, {}

        top_entities: List[EntityCentrality] = []
        for node in case_nodes:
            d_type = graph.nodes[node].get("entity_type", "Unknown")
            top_entities.append(EntityCentrality(
                entity_id=node,
                entity_type=d_type,
                degree=round(deg_centrality.get(node, 0.0), 4),
                betweenness=round(bet_centrality.get(node, 0.0), 4),
                closeness=round(close_centrality.get(node, 0.0), 4),
                pagerank=round(pr_centrality.get(node, 0.0), 4)
            ))

        # Sort by betweenness & degree
        top_entities.sort(key=lambda x: (x.betweenness, x.degree), reverse=True)

        # Community Detection via Connected Components or Greedy Modularity
        communities: List[CommunityCluster] = []
        try:
            components = list(nx.connected_components(undirected_subgraph))
            for idx, comp in enumerate(components):
                comp_list = list(comp)
                types = list(set([graph.nodes[n].get("entity_type", "Unknown") for n in comp_list]))
                # Bridge entities have high betweenness (> 0.1)
                bridges = [n for n in comp_list if bet_centrality.get(n, 0.0) > 0.1]
                communities.append(CommunityCluster(
                    community_id=f"CLUSTER-{idx+1}",
                    entities=comp_list,
                    size=len(comp_list),
                    dominant_types=types,
                    bridge_entities=bridges
                ))
        except Exception as e:
            logger.warning(f"Error computing communities: {e}")

        density = nx.density(undirected_subgraph) if len(undirected_subgraph) > 1 else 0.0

        return NetworkAnalytics(
            total_nodes=subgraph.number_of_nodes(),
            total_edges=subgraph.number_of_edges(),
            density=round(density, 4),
            communities_count=len(communities),
            top_centrality_entities=top_entities[:10],
            communities=communities
        )
