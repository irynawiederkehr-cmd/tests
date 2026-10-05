import re
CYR=re.compile(r'[А-Яа-яЁёІіЇїЄєҐґ]')
def tokenize(src):
    """Split JS into list of ('code',text) / ('str',quote,content) / ('tpl',parts) / ('com',text).
    Template literals: parts list alternating text and ('expr', tokens)."""
    out=[]; i=0; n=len(src); buf=[]
    def flush():
        if buf: out.append(('code',''.join(buf))); buf.clear()
    prev_sig=''
    while i<n:
        c=src[i]
        if c=='/' and i+1<n and src[i+1]=='/':
            j=src.find('\n',i); j=n if j<0 else j
            flush(); out.append(('com',src[i:j])); i=j; continue
        if c=='/' and i+1<n and src[i+1]=='*':
            j=src.find('*/',i+2); j=n if j<0 else j+2
            flush(); out.append(('com',src[i:j])); i=j; continue
        if c in '"\'':
            j=i+1
            while j<n and src[j]!=c:
                if src[j]=='\\': j+=2
                else: j+=1
            flush(); out.append(('str',c,src[i+1:j])); i=j+1; prev_sig='s'; continue
        if c=='`':
            parts,j=read_tpl(src,i+1)
            flush(); out.append(('tpl',parts)); i=j; prev_sig='s'; continue
        if c=='/':
            # regex literal heuristic
            k=len(''.join(buf))-1; b=''.join(buf).rstrip()
            last=b[-1] if b else (out[-1][0][0] if out else '(')
            if (not b and (not out or out[-1][0] in ('com',))) or (b and b[-1] in '(,=:[!&|?{};+-*%<>~^') or b.endswith('return'):
                j=i+1; incls=False
                while j<n:
                    if src[j]=='\\': j+=2; continue
                    if src[j]=='[': incls=True
                    elif src[j]==']': incls=False
                    elif src[j]=='/' and not incls: break
                    elif src[j]=='\n': break
                    j+=1
                if j<n and src[j]=='/':
                    j+=1
                    while j<n and src[j].isalpha(): j+=1
                    buf.append(src[i:j]); i=j; continue
        buf.append(c); i+=1
    flush(); return out
def read_tpl(src,i):
    parts=[]; cur=[]; n=len(src)
    while i<n:
        c=src[i]
        if c=='\\': cur.append(src[i:i+2]); i+=2; continue
        if c=='`': parts.append(''.join(cur)); return parts,i+1
        if c=='$' and i+1<n and src[i+1]=='{':
            parts.append(''.join(cur)); cur=[]
            depth=1; j=i+2; start=j
            while j<n and depth:
                ch=src[j]
                if ch in '"\'':
                    q=ch; j+=1
                    while j<n and src[j]!=q:
                        j+= 2 if src[j]=='\\' else 1
                    j+=1; continue
                if ch=='`':
                    _,j=read_tpl(src,j+1); continue
                if ch=='{': depth+=1
                elif ch=='}': depth-=1
                j+=1
            expr=src[start:j-1]
            parts.append(('expr',tokenize(expr)))
            i=j; continue
        cur.append(c); i+=1
    raise ValueError('unterminated template')
def render(toks):
    o=[]
    for t in toks:
        if t[0]=='code' or t[0]=='com': o.append(t[1])
        elif t[0]=='str': o.append(t[1]+t[2]+t[1])
        elif t[0]=='tpl':
            o.append('`')
            for p in t[1]:
                if isinstance(p,tuple): o.append('${'+render(p[1])+'}')
                else: o.append(p)
            o.append('`')
    return ''.join(o)
def walk_texts(toks, fn):
    """apply fn to every string literal content and template text part; returns new tokens"""
    res=[]
    for t in toks:
        if t[0]=='str': res.append(('str',t[1],fn(t[2],t[1])))
        elif t[0]=='tpl':
            res.append(('tpl',[('expr',walk_texts(p[1],fn)) if isinstance(p,tuple) else fn(p,'`') for p in t[1]]))
        else: res.append(t)
    return res
def texts(toks):
    acc=[]
    walk_texts(toks, lambda s,q: (acc.append(s), s)[1])
    return acc
def skeleton(toks):
    return render(walk_texts([t for t in toks if t[0]!='com'], lambda s,q: '§' if CYR.search(s) or re.search(r'[A-Za-zÄÖÜäöüß]{3,}\s+[A-Za-zÄÖÜäöüß]{2,}',s) else s))
