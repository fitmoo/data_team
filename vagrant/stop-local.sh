#!/bin/bash

echo "--------------------------------------------------------------------------------"
echo "Stop  run fitmoo admin-tool local & kill processes"
echo "--------------------------------------------------------------------------------"

kill -9 `ps aux | grep grunt | grep -v grep | awk '{print $2}'`
kill -9 `ps aux | grep node | grep -v grep | awk '{print $2}'`
kill -9 `ps aux | grep mongod | grep -v grep | awk '{print $2}'`
kill -9 `ps aux | grep grunt | grep -v grep | awk '{print $2}'`
kill -9 `ps aux | grep node | grep -v grep | awk '{print $2}'`
kill -9 `ps aux | grep mongod | grep -v grep | awk '{print $2}'`