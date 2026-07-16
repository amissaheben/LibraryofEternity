from pathlib import Path
import re, sys
ROOT=Path(__file__).resolve().parents[2]
REQ={'id','title','document_class','layer','status','version','stability','provenance','dependencies','evidence_score','necessity_score','last_updated'}
PAT=re.compile(r'^[A-Z]+(?:-[A-Z]+)?-\d{4}$')
def fm(p):
 t=p.read_text(encoding='utf-8')
 if not t.startswith('---\n'): return {}
 end=t.find('\n---\n',4)
 if end<0:return {}
 d={}
 for line in t[4:end].splitlines():
  if line and not line.startswith(' ') and ':' in line:
   k,v=line.split(':',1);d[k.strip()]=v.strip()
 return d
errs=[];seen={};count=0
for p in ROOT.rglob('*.md'):
 if '06-TEMPLATES' in p.parts or 'Retired' in p.parts: continue
 m=fm(p)
 if not m: continue
 count+=1
 miss=REQ-set(m)
 if miss: errs.append(f'{p.relative_to(ROOT)} missing {sorted(miss)}')
 i=m.get('id','')
 if i:
  if i in seen: errs.append(f'duplicate {i}')
  seen[i]=p
  if not PAT.match(i): errs.append(f'invalid id {i}')
print(f'Library Validator — scanned {count} metadata documents')
if errs:
 print('FAIL');print('\n'.join('- '+e for e in errs));sys.exit(1)
print('PASS — metadata documents structurally valid')
