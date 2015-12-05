interface GraphNode {
	
}

interface SNNode extends GraphNode {
	id 			: Number
	label		: String
}

interface Cluster {
	
}

interface SNCluster {
	id		: Number
	nodes : GraphNode[]
}


function nodeNodeDistance( node_a:GraphNode, node_b:GraphNode) : Number {
	var distance = 0;
	
	return distance;
}


function nodeClusterDistance( node:GraphNode, cluster:SNCluster) : Number {
	var distance = 0;
	
	return distance;
}
