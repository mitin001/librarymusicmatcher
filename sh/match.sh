python3.9 audfprint/audfprint.py precompute "$1" -p precompute --shifts 4 2>&1 >> "$2"
for p in $(ls pklz/*.pklz)
do
  echo >> "$2"
  python3.9 audfprint/audfprint.py match --dbase $p precompute/"$1".afpt -R 2>&1 >> "$2"
done
