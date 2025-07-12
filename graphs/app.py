import streamlit as st
import pandas as pd
import networkx as nx
from pyvis.network import Network
import tempfile
import base64


def g6_to_graph(g6_string):
    try:
        return nx.from_graph6_bytes(g6_string.encode('ascii'))
    except Exception as e:
        st.warning(f"Error converting {g6_string}: {e}")
        return None


def display_interactive_graph(g, key):
    net = Network(height="300px", width="100%", notebook=False, directed=False)
    net.from_nx(g)
    net.repulsion(node_distance=100, central_gravity=0.3)

    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".html")
    net.save_graph(temp_file.name)

    with open(temp_file.name, 'r', encoding='utf-8') as f:
        html_string = f.read()

    st.components.v1.html(html_string, height=350, scrolling=False)


def main():
    st.set_page_config(page_title="GraphTea Streamlit", layout="wide")
    st.title("GraphTea in Streamlit")

    default_g6 = "A_,BW,Bw,CF,CU,CV,C],C^,C~,D?{,DCw,DC{,DEw,DEk,DE{,DFw,DF{,DQo,DQw,DQ{,DUW,DUw,DU{,DTw,DT{,DV{,D]w,D]{,D^{,D~{"
    g6_input = st.text_input("Enter a list of G6 strings (comma-separated):", default_g6)
    g6_list = [s.strip() for s in g6_input.split(",") if s.strip()]

    show_images = st.checkbox("Generate Graph Images Instead of Interactive Graphs")
    graphs = []
    names = []

    st.subheader("Generated Graphs")

    cols = st.columns(3)
    for i, g6 in enumerate(g6_list):
        g = g6_to_graph(g6)
        if g:
            names.append(f"G{i + 1}")
            graphs.append(g)

            with cols[i % 3]:
                st.markdown(f"**Graph G{i + 1}**")
                if show_images:
                    st.graphviz_chart(nx.nx_pydot.to_pydot(g).to_string())
                else:
                    display_interactive_graph(g, key=f"graph{i}")

    if st.button("Show Comparison Table"):
        try:
            df = pd.read_csv("upton5_homs2.csv", header=None)
            st.subheader("Graph Comparison Table")

            # Create a square matrix filled with "-"
            size = len(graphs)
            table = [["-" for _ in range(size)] for _ in range(size)]

            for _, row in df.iterrows():
                r, c, v = int(row[0]), int(row[1]), int(row[2])
                if 0 <= r < size and 0 <= c < size:
                    table[r][c] = v

            df_table = pd.DataFrame(table, columns=names, index=names)
            st.dataframe(df_table.style.applymap(lambda v: 'background-color: yellow' if v == 0 else ''))

        except FileNotFoundError:
            st.error("upton5_homs2.csv not found. Please upload the CSV file.")


if __name__ == "__main__":
    main()
