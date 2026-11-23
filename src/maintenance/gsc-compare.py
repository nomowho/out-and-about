"""Compare two private Search Console CSV exports; never writes inside the site.
Usage: python src/maintenance/gsc-compare.py BEFORE.zip AFTER.zip --out C:/private/comparison.json
Export both with the same search type/country/device filters and complete date windows.
"""
import argparse,csv,io,json,zipfile
from pathlib import Path
from datetime import date
def rows(source,name):
 p=Path(source)
 if p.is_dir(): return list(csv.DictReader((p/(name+'.csv')).read_text(encoding='utf-8-sig').splitlines()))
 with zipfile.ZipFile(p) as z:
  matches=[n for n in z.namelist() if n.endswith(name+'.csv')]
  if len(matches)!=1: raise ValueError('Expected one '+name+'.csv')
  return list(csv.DictReader(io.StringIO(z.read(matches[0]).decode('utf-8-sig'))))
def number(v):return float(str(v).replace(',','').replace('%','') or 0)
def totals(rs):
 clicks=sum(number(r.get('點擊次數',r.get('點擊',0))) for r in rs); imp=sum(number(r.get('曝光次數',r.get('曝光',0))) for r in rs)
 weighted=sum(number(r['排名'])*number(r.get('曝光次數',r.get('曝光',0))) for r in rs)
 return {'clicks':clicks,'impressions':imp,'ctr_percent':clicks/imp*100 if imp else None,'position':weighted/imp if imp else None}
def compare(before,after):
 a,b=rows(before,'圖表'),rows(after,'圖表')
 if not a or not b:raise ValueError('Both exports need daily chart rows')
 def dates(rs):return sorted(date.fromisoformat(r['日期']) for r in rs)
 da,db=dates(a),dates(b)
 if set(da)&set(db):raise ValueError('Comparison windows overlap')
 if (da[-1]-da[0]).days+1!=len(da) or (db[-1]-db[0]).days+1!=len(db):raise ValueError('Missing daily rows')
 if len(a)!=len(b):raise ValueError('Use equal-length windows')
 # Date labels must differ; every other export filter must remain identical.
 fa,fb=rows(before,'篩選器'),rows(after,'篩選器')
 def filters(rs):return [r for r in rs if not any('日期' in str(v) for v in r.values())]
 if filters(fa)!=filters(fb):raise ValueError('Search type or other filters differ')
 ta,tb=totals(a),totals(b)
 result={'before':{'start':str(da[0]),'end':str(da[-1]),**ta},'after':{'start':str(db[0]),'end':str(db[-1]),**tb},'delta':{k:(tb[k]-ta[k]) if ta[k] is not None and tb[k] is not None else None for k in ta},'tables':{},'notes':['Queries may be anonymized; do not sum query or page rows to replace chart totals.','CTR changes alone do not prove an SEO effect; compare query, device, country and rank.','Chart dates use the export reporting timezone. Recent incomplete days should be excluded.']}
 for name in ['查詢','網頁','裝置','國家_地區']:
  ar,br=rows(before,name),rows(after,name)
  if not ar or not br:continue
  key=next(iter(ar[0])); av={r[key]:r for r in ar};bv={r[key]:r for r in br}
  result['tables'][name]=[{'name':k,'before':totals([av[k]]) if k in av else None,'after':totals([bv[k]]) if k in bv else None} for k in sorted(av.keys()|bv.keys())]
 return result
if __name__=='__main__':
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('before');parser.add_argument('after');parser.add_argument('--out',required=True);args=parser.parse_args()
 dest=Path(args.out).resolve(); repo=Path(__file__).resolve().parents[2]
 if dest.is_relative_to(repo):parser.error('Keep private GSC reports outside the public repository')
 dest.write_text(json.dumps(compare(args.before,args.after),ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print('Saved private comparison:',dest)
