#include <emscripten.h>
//#include <iostream>
#include <vector>
#include <iostream>

using std::string;
using std::vector;

int BIAS6 = 63;
int SMALLN = 62;
int SMALLISHN = 258047;
int TOPBIT6 = 32;
int WORDSIZE = 32;

int SIZELEN(int n) {
    return (n) <= SMALLN ? 1 : ((n) <= SMALLISHN ? 4 : 8);
}

int SETWD(int pos) {
    return ((pos) >> 5);
}

int SETBT(int pos) {
    return ((pos) & 037);
}

int graphsize(std::string s) {
    std::string p;
    if (s[0] == ':') p = s.substr(1);
    else p = s;
    int n;
    n = p[0] - BIAS6;

    if (n > SMALLN) {
        n = p[1] - BIAS6;
        n = (n << 6) | (p[2] - BIAS6);
        n = (n << 6) | (p[3] - BIAS6);
    }
    return n;
}

EMSCRIPTEN_KEEPALIVE
const char* print_string(const char* g66) {
    std::string g6(g66)
 int n = graphsize(g6);

    std::string graph = "";
    std::string p = g6;
    
    if (g6[0] == ':' || g6[0] == '&')
        p = g6[1];

    p = p.substr(SIZELEN(n));

    int m = (n + WORDSIZE - 1) / WORDSIZE;
    int x = 0;
    vector<long> g;// = new long[m * n];
    for (int ii = m * n; --ii > 0;) g.emplace_back(0);
    g[0] = 0;
    int k = 1;
    int it = 0;
    for (int j = 1; j < n; ++j) {
        for (int i = 0; i < j; ++i) {
            if (--k == 0) {
                k = 6;
                x = p[it] - BIAS6;
                it++;
            }
            if ((x & TOPBIT6) != 0)
                graph += std::to_string(i)+std::string(",")+std::to_string(j)+std::string("--");
            x <<= 1;
        }
    }
    char* ret = (char*) malloc(graph.size() + 1);
    strcpy(ret, graph.c_str());
    
    return ret;
}

