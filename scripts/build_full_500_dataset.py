# scripts/build_full_500_dataset.py
# -*- coding: utf-8 -*-
import json
import os
import sys

from generate_all_authentic import PHOTOS
from data_vietnam import VIETNAM_DISHES
from data_asia import ASIA_DISHES
from data_western import WESTERN_DISHES

print(f"Base loaded: Vietnam={len(VIETNAM_DISHES)}, Asia={len(ASIA_DISHES)}, Western={len(WESTERN_DISHES)}")
