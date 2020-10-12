FROM ubuntu:focal

ARG DEBIAN_FRONTEND=noninteractive

ENV LC_ALL C.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US.UTF-8

RUN apt-get update && apt-get clean && apt-get install -y \
    python \
    python3-pip \
    python3-numpy \
    nodejs \
    wget \
    unzip

EXPOSE 8020

RUN pip3 install --upgrade pip

ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini

WORKDIR /home/
RUN wget https://github.com/odwyersoftware/mega.py/archive/master.zip && unzip master.zip 
WORKDIR /home/mega.py-master
RUN python3 setup.py install
WORKDIR /home/

COPY vs /home/vs/
COPY megamanager.py /home/
COPY download.py /home/

COPY bootstrap.sh /

CMD ["/tini", "/bootstrap.sh"]
