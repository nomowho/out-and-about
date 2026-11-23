import importlib.util,tempfile,csv
from pathlib import Path
spec=importlib.util.spec_from_file_location('gsc',Path(__file__).resolve().parents[1]/'maintenance/gsc-compare.py');gsc=importlib.util.module_from_spec(spec);spec.loader.exec_module(gsc)
with tempfile.TemporaryDirectory() as d:
 a=Path(d)/'a';b=Path(d)/'b';a.mkdir();b.mkdir()
 for p,day,clicks,imp in [(a,'2026-11-01',1,10),(b,'2026-11-02',2,10)]:
  (p/'圖表.csv').write_text(f'日期,點擊,曝光,點閱率,排名\n{day},{clicks},{imp},,5\n',encoding='utf-8')
  (p/'篩選器.csv').write_text('篩選器,值\n搜尋類型,網頁 (文字型)\n日期,自訂\n',encoding='utf-8')
  for table in ['查詢','網頁','裝置','國家_地區']:(p/(table+'.csv')).write_text(f'項目,點擊次數,曝光次數,點閱率,排名\n測試,{clicks},{imp},,5\n',encoding='utf-8')
 r=gsc.compare(a,b);assert r['delta']['ctr_percent']==10;assert r['before']['clicks']==1;assert r['after']['position']==5
 (b/'篩選器.csv').write_text('篩選器,值\n搜尋類型,圖片\n',encoding='utf-8')
 try:gsc.compare(a,b);raise AssertionError('filters not checked')
 except ValueError:pass
 assert gsc.totals([{'點擊':0,'曝光':0,'排名':''}])['ctr_percent'] is None
 print('PASS GSC comparison: both CSV header variants, weighted position, CTR percentage points, filter mismatch and zero impressions')
