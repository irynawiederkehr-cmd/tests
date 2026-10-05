import sys,re,difflib,json
sys.path.insert(0,'.')
from jstok import *
PH='⟦%d⟧'
def tpl_text(parts):
    o=[];k=0
    for p in parts:
        if isinstance(p,tuple): o.append(PH%k); k+=1
        else: o.append(p)
    return ''.join(o)
def flat(toks,acc):
    """items: ('c',piece) | ('u',text,kind) ; kind 's' string or 't' template"""
    for t in toks:
        if t[0]=='com': continue
        if t[0]=='code':
            for p in re.findall(r'[A-Za-z_$][\w$]*|\d+|\S',t[1]): acc.append(('c',p))
        elif t[0]=='str': acc.append(('u',t[2],'s'))
        elif t[0]=='tpl':
            txt=tpl_text(t[1])
            acc.append(('u',txt,'t'))
            for p in t[1]:
                if isinstance(p,tuple): acc.append(('c','${')); flat(p[1],acc); acc.append(('c','}'))
    return acc
NAT=re.compile(r'[A-Za-zÄÖÜäöüßÀ-ÿ’]{2,}[ ,.!?:;]')
def natural(s): return bool(CYR.search(re.sub(r'⟦\d+⟧','',s)))
def key(it):
    if it[0]=='c': return 'c:'+it[1]
    s=re.sub(r'⟦\d+⟧','',it[1])
    if CYR.search(s) or NAT.search(s): return 'u:§'+it[2]
    return 'u:'+it[1]
def units_of(src):
    return [x[1] for x in flat(tokenize(src),[]) if x[0]=='u' and natural(x[1])]
def align_units(ru_src,tr_src):
    a=flat(tokenize(ru_src),[]); b=flat(tokenize(tr_src),[])
    sm=difflib.SequenceMatcher(None,[key(x) for x in a],[key(x) for x in b],autojunk=False)
    mem={}
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            x=a[blk.a+k]; y=b[blk.b+k]
            if x[0]=='u' and natural(x[1]):
                # placeholders count must match
                if len(re.findall(r'⟦\d+⟧',x[1]))==len(re.findall(r'⟦\d+⟧',y[1])):
                    mem.setdefault(x[1],y[1])
    return mem
def apply(src, tr):
    """replace natural units in src by tr[unit]; raises KeyError if missing"""
    toks=tokenize(src)
    def conv(toks):
        res=[]
        for t in toks:
            if t[0]=='str' and natural(t[2]):
                v=tr[t[2]]
                q=t[1]
                if q in v and ('\\'+q) not in v: v=v.replace(q,'\\'+q)
                res.append(('str',q,v))
            elif t[0]=='tpl':
                parts=[('expr',conv(p[1])) if isinstance(p,tuple) else p for p in t[1]]
                txt=tpl_text(t[1])
                if natural(txt):
                    new=tr[txt].replace('`','\\`'); exprs=[p for p in parts if isinstance(p,tuple)]
                    segs=re.split(r'(⟦\d+⟧)',new); out=[]
                    for sg in segs:
                        m=re.fullmatch(r'⟦(\d+)⟧',sg)
                        if m: out.append(exprs[int(m.group(1))])
                        else: out.append(sg)
                    # template parts must alternate text/expr; merge adjacent texts
                    norm=[]
                    for o in out:
                        if isinstance(o,tuple):
                            if not norm or isinstance(norm[-1],tuple): norm.append('')
                            norm.append(o)
                        else:
                            if norm and not isinstance(norm[-1],tuple): norm[-1]+=o
                            else: norm.append(o)
                    if not norm or isinstance(norm[-1],tuple): norm.append('')
                    res.append(('tpl',norm))
                else: res.append(('tpl',parts))
            else: res.append(t)
        return res
    return render(conv(toks))
